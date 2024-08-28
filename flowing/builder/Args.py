# Copyright © 2024 PMoS. All rights reserved.

import os
import numpy as np
import torch
from torch import nn
from typing import Tuple, List, Any

from flowing.shower import Logger
from flowing.builder.struct import LossPair, ModelPair

DEFAULT_MODEL_SAVE_NAME = "{name}_{build_id}_e{epoch}.pth"
DEFAULT_MODEL_PARAMS_SAVE_NAME = "{name}_{build_id}_e{epoch}_params.pth"


class Args:
    """
    attribute:
        - models, optimizers, criteria: modules used on the train flow.
        - data_buffer: when the beginning of each time get data from dataloader, the data from dataloader will push
            or replace to the front of the buffer. it's to say that the front place of the data_buffer is retained
            for the data get from dataloader. other data can be pushed to the back of the buffer.
          e.g.: [data_from_dataloader_0, ..., data_from_dataloader_N, data0, data1, ...]
        - loss_buffer: save loss calculated during training, using (ModelIndex, Loss).
          e.g.: [(0,loss0), (3,loss1), (2,loss2), ...]
        - information_buffer: save information calculated during training, such as Acc, IoU, etc.
    """
    models: Tuple[ModelPair, ...] | List[ModelPair] = None
    optimizers: Tuple[torch.optim.Optimizer, ...] | List[torch.optim.Optimizer] = None
    criteria: Tuple[nn.Module, ...] | List[nn.Module] = None
    data_buffer: List[Any] = None
    loss_buffer: List[LossPair] = None
    information_buffer: dict[str, float] = None
    model_save_dir: str = None
    epoch: int
    build_id: str
    is_train: bool
    device: torch.device = None

    _loss: list[float]  # (model_idx, loss)
    _calculate_count: int = 0

    __loss_information_key_fmt: str = "{model_name}_avg_loss"
    __loss_not_used_information_key_fmt: str = "ub_{model_name}_avg_loss"

    def __init__(
            self,
            models: Tuple[Tuple[str, nn.Module], ...] | List[Tuple[str, nn.Module]],
            optimizers: Tuple[torch.optim.Optimizer, ...] | List[torch.optim.Optimizer],
            criteria: Tuple[nn.Module, ...] | List[nn.Module],
            is_train: bool,
            epoch: int,
            build_id: str,
            model_save_dir: str = None,
            device: torch.device = torch.device('cpu'),
    ):
        self.models = [ModelPair(name=name, model=model.to(device=device)) for name, model in models]
        self.optimizers = optimizers
        self.criteria = [loss_func.to(device=device) for loss_func in criteria]
        self.epoch = epoch
        self.build_id = build_id
        self.device = device
        self.is_train = is_train
        self.information_buffer = {}

        self._loss = [0.0] * len(self.models)
        self._not_used_loss = [0.0] * len(self.models)
        self.__clear_data_buffer()
        self.__clear_loss_buffer()

        # check save problems
        if model_save_dir is not None:
            self.model_save_dir = os.path.abspath(model_save_dir)
            try:
                os.makedirs(self.model_save_dir, exist_ok=True)
            except Exception:
                raise Exception(
                    f"Args: Directory '{self.model_save_dir}' creation failure, "
                    f"please check the authority or the directory."
                )

            for model_pair in self.models:
                try:
                    torch.jit.script(model_pair.model)
                except RuntimeError:
                    Logger.warning(
                        f"Model '{model_pair.name}' failed to be scripted, "
                        f"so it will be saved using torch.save() method."
                    )
        elif is_train:
            Logger.warning("Models will not be saved at this epoch.")

        # init model
        if is_train:
            for model_pair in self.models:
                model_pair.model.train()
        else:
            for model_pair in self.models:
                model_pair.model.eval()

    def update_loss_information(self, loss_item: int, model_idx: int):
        if loss_item is None:
            self.information_buffer[self.__loss_information_key_fmt.format(model_name=self.models[model_idx].name)] = \
                np.nan
            return

        if self._calculate_count == 0:
            raise Exception(
                "Args: Please call .start() before doing other things."
            )

        self._loss[model_idx] += loss_item
        self.information_buffer[self.__loss_information_key_fmt.format(model_name=self.models[model_idx].name)] = \
            self._loss[model_idx] / self._calculate_count

    def push(self, data_from_dataloader: tuple[any]):
        self.__clear_data_buffer()
        self.__clear_loss_buffer()
        self._calculate_count += 1

        for d in data_from_dataloader:
            self.data_buffer.append(d.to(self.device))

    def end(self):
        self.loss_buffer = list(self.loss_buffer)
        if len(self.loss_buffer):
            for loss_pair in self.loss_buffer:
                self._not_used_loss[loss_pair.model_idx] += loss_pair.loss.item()

            for model_idx in range(len(self.models)):
                if self._not_used_loss[model_idx] > 0:
                    self.information_buffer[
                        self.__loss_not_used_information_key_fmt.format(model_name=self.models[model_idx].name)
                    ] = self._not_used_loss[model_idx] / self._calculate_count

    def stop(self):
        # when model_save_path == None means no save.
        if self.model_save_dir is not None:
            def save_model(pair):
                if self.is_train:
                    pair.model.eval()
                try:
                    model_scripted = torch.jit.script(pair.model)
                    save_path = os.path.join(
                        self.model_save_dir,
                        DEFAULT_MODEL_SAVE_NAME.format(name=pair.name, build_id=self.build_id, epoch=self.epoch)
                    )
                    model_scripted.save(save_path)
                    Logger.info(
                        f"Model '{pair.name}' be saved in '{save_path}'"
                    )
                except RuntimeError:
                    save_path = os.path.join(
                        self.model_save_dir,
                        DEFAULT_MODEL_PARAMS_SAVE_NAME.format(name=pair.name, build_id=self.build_id, epoch=self.epoch)
                    )
                    torch.save(pair.model, save_path)
                    Logger.info(
                        f"Model '{pair.name}' be saved in '{save_path}' by using torch.save()."
                    )
                if self.is_train:
                    pair.model.train()

            for model_pair in self.models:
                save_model(model_pair)

    def __clear_data_buffer(self):
        self.data_buffer = []

    def __clear_loss_buffer(self):
        self.loss_buffer = []

    def __repr__(self):
        # filter class
        self.loss_buffer = list(self.loss_buffer)
        return (f"Args("
                f"models:{self.models}, "
                f"optimizers:{[opt.__class__ for opt in self.optimizers]}, "
                f"criteria:{[criterion.__class__ for criterion in self.criteria]}, "
                f"data_buffer:{[data.shape if (isinstance(data, torch.Tensor) or isinstance(data, np.ndarray)) else data
                                for data in self.data_buffer]}, "
                f"loss_buffer:{self.loss_buffer}, "
                f"device:{self.device})")
