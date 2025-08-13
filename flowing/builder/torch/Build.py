# Copyright © 2024 PMoS. All rights reserved.

import os
import time
import torch
from torch import nn
from tabulate import tabulate
from typing import Tuple, List, Dict
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter

from flowing.shower import Logger
from flowing.builder.torch import Transit
from flowing.builder.action import Action
from flowing.helper.torch import LearningRate, Compile

DEFAULT_TENSORBOARD_LOG_DIR_FMT = './log/{build_id}/tb_log'
SHOW_TABLE_HEADER = ["Item", "Current", "Previous", "Trend"]


def _get_show_table_info(prev_info: Dict | None, current_info: Dict) -> List[List]:
    if prev_info is None:
        return [[key, value, None, "-"] for key, value in current_info.items()]
    return [
        [key, value, prev_info[key], "-" if value == prev_info[key] else "↑" if value > prev_info[key] else "↓"]
        for key, value in current_info.items()
    ]


def build(
        train_data_loader: DataLoader,
        val_data_loader: DataLoader,
        models: Tuple[Tuple[str, nn.Module], ...] | List[Tuple[str, nn.Module]],
        optimizers: Tuple[torch.optim.Optimizer, ...] | List[torch.optim.Optimizer],
        criteria: Tuple[nn.Module, ...] | List[nn.Module],
        train_actions: List[Action],
        val_actions: List[Action],
        model_save_dir: str = None,
        device: torch.device = torch.device('cpu'),
        current_epoch: int = 0,
        train_epoch_amount: int = 0,
        val_after_train_epoch: int = 1,
        save_after_train_epoch: int = 1,
        tensorboard_enabled: bool = True,
        build_id: str = None,
        change_model_learning_rate: bool = True,
        compile_models: bool = True,
        debug_mode: bool = False
):
    if compile_models:
        available_compile = Compile.get_available_compile()
        if len(available_compile) != 0:
            for name, model in models:
                model.compile(backend=available_compile[0])
            Logger.info(f"Models have been compiled by backend {available_compile[0]}.")
        else:
            Logger.warning("No one of compile backend is available.")

    if build_id is None:
        build_id = f"build{time.time_ns()}"
    Logger.info(f"This build as known as: {build_id}.")

    tensorboard_writer = None
    if tensorboard_enabled:
        tensorboard_log_dir = DEFAULT_TENSORBOARD_LOG_DIR_FMT.format(build_id=build_id)
        if not os.path.exists(tensorboard_log_dir):
            os.makedirs(tensorboard_log_dir)
        tensorboard_writer = SummaryWriter(log_dir=tensorboard_log_dir)
        Logger.info(
            f'More information can be found by the following:'
            f'\n\t>>> tensorboard --logdir "{os.path.abspath(tensorboard_log_dir)}" --bind_all'
        )

    if val_data_loader is None:
        Logger.warning("Validation's dataloader is None.")
        val_after_train_epoch = -1
    if val_after_train_epoch < 1:
        val_after_train_epoch = -1
    if save_after_train_epoch < 1:
        save_after_train_epoch = -1
    if train_data_loader == val_data_loader:
        Logger.warning("Train's and validation's dataloader are the same one.")

    Logger.info(f"Begin to training {train_epoch_amount} times.")

    prev_train_info = None
    prev_val_info = None

    train_count = 0
    for epoch in range(current_epoch, current_epoch + train_epoch_amount):
        train_count += 1
        # train
        cur_save_dir = None if save_after_train_epoch < 1 or (train_count % save_after_train_epoch) else model_save_dir
        info = Transit.transit(
            data_loader=train_data_loader,
            models=models,
            optimizers=optimizers,
            criteria=criteria,
            actions=train_actions,
            model_save_dir=cur_save_dir,
            build_id=build_id,
            epoch=epoch,
            device=device,
            train_mode=True,
            debug_mode=debug_mode,
        )

        Logger.info(
            f"After train_{epoch} models get in train dataset:\n"
            f"""{tabulate(
                _get_show_table_info(prev_info=prev_train_info, current_info=info),
                headers=SHOW_TABLE_HEADER, tablefmt="rst",
                numalign="right", stralign="left", floatfmt=".5f"
            )}"""
        )
        if tensorboard_enabled:
            for key, value in info.items():
                tensorboard_writer.add_scalar(f"train/{key}", value, epoch)
        prev_train_info = info

        # validation
        if val_after_train_epoch > 0 and (train_count % val_after_train_epoch) == 0:
            with torch.no_grad():
                info = Transit.transit(
                    data_loader=val_data_loader,
                    models=models,
                    optimizers=optimizers,
                    criteria=criteria,
                    actions=val_actions,
                    build_id=build_id,
                    epoch=epoch,
                    device=device,
                    train_mode=False,
                    debug_mode=debug_mode,
                )

                Logger.info(
                    f"After train_{epoch} models get in valid dataset:\n"
                    f"""{tabulate(
                        _get_show_table_info(prev_info=prev_val_info, current_info=info),
                        headers=SHOW_TABLE_HEADER, tablefmt="rst",
                        numalign="right", stralign="left", floatfmt=".5f"
                    )}"""
                )
                if tensorboard_enabled:
                    for key, value in info.items():
                        tensorboard_writer.add_scalar(f"valid/{key}", value, epoch)
                prev_val_info = info

        if change_model_learning_rate:
            pre_lr, now_lr = [], []
            for opt in optimizers:
                pre_lr.append(LearningRate.get_rate(opt))
                LearningRate.set_new_rate_by_now(opt)
                now_lr.append(LearningRate.get_rate(opt))
            Logger.info(f"Change learning rate from {pre_lr} to {now_lr}.")

    if tensorboard_enabled:
        tensorboard_writer.close()
    Logger.info("All done!")
