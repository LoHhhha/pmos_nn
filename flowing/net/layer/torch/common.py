# Copyright © 2025 PMoS. All rights reserved.

import inspect
from abc import ABC
from typing import Tuple, Dict, Any

import torch

from flowing.net.layer.layer import Layer
from flowing.shower import Logger


class _TorchLayer(Layer, ABC):
    _api_package = ...

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        api = getattr(self._api_package, self._api_name, None)

        if inspect.isclass(api) and issubclass(api, torch.nn.Module):
            self._api_init_func = api.__init__
            self._api_forward_func = api.forward
        elif inspect.isfunction(api) or inspect.ismethod(api) or inspect.isbuiltin(api):
            self._api_forward_func = api
        # will not assign _api_init_func and _api_forward_func
        elif api is None:
            Logger.warning(f"could not find {self._api_name} in {self._api_package}")
        else:
            Logger.warning(
                f"unexpected object get from {self._api_package}.{self._api_name}, got {api}"
            )


class TorchNNLayer(_TorchLayer, ABC):
    _api_package = torch.nn

    def init_code(
            self,
            package: str = "torch.nn",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        return super().init_code(
            package=package,
            add_self=add_self,
            extend_params=extend_params,
            only_right_value=only_right_value
        )


class TorchLayer(_TorchLayer, ABC):
    _api_package = torch

    def init_code(
            self,
            package: str = "",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        if only_right_value:
            raise ValueError(
                "this Layer haven't initial code"
            )
        return ()
