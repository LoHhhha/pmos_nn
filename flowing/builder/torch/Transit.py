# Copyright © 2024 PMoS. All rights reserved.

import torch
from torch import nn
from torch.utils.data import DataLoader
from typing import Tuple, List
import tqdm

from flowing.builder.torch import Args
from flowing.builder import Action


def transit(data_loader: DataLoader,
            models: Tuple[Tuple[str, nn.Module], ...] | List[Tuple[str, nn.Module]],
            optimizers: Tuple[torch.optim.Optimizer, ...] | List[torch.optim.Optimizer],
            criteria: Tuple[nn.Module, ...] | List[nn.Module],
            actions: List[Action],
            build_id: str,
            model_save_dir: str = None,
            device: torch.device = torch.device('cpu'),
            epoch: int = 0,
            train_mode: bool = True,
            debug_mode: bool = False) -> dict[str, any]:
    """
    Args:
        data_loader: Dataloader for a LinkDataset which contains all the data for training.
        models: Modules which need to be trained.
        optimizers: Train optimizers.
            tips: model and optimizer need to be aligned. such as optimizer[0] and model[0] need to be a pair.
        criteria: Loss function for training.
        actions: show how the flows are, helps this function to train the model.
        model_save_dir: dir of model saving.
        build_id: get from upper module.
        device: training device cpu or cuda.
        epoch: using to desc the training times.
        train_mode: is this epoch needs to be seen as training.
        debug_mode: if to show some detailed information about the training process.
    """

    if len(models) != len(optimizers):
        raise ValueError("Models and optimizers must have the same number.")

    args = Args(
        models=models,
        optimizers=optimizers,
        criteria=criteria,
        device=device,
        epoch=epoch,
        build_id=build_id,
        model_save_dir=model_save_dir,
        is_train=train_mode,
    )

    pbar = tqdm.tqdm(iterable=data_loader, desc=f"train_{epoch}" if train_mode else f"valid_in_{epoch}")
    data_times = 0
    for data in pbar:
        # init
        args.push(data_from_dataloader=data)

        for action in actions:
            action(args=args, data_times=data_times, print_detail=debug_mode)

        pbar.set_postfix(**args.information_buffer)
        data_times += 1

        args.end()

    pbar.close()
    args.stop()

    return args.information_buffer
