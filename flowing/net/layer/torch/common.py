# Copyright © 2025 PMoS. All rights reserved.

import inspect
from abc import ABC
from typing import Tuple

import torch

from flowing.net.layer.layer import Layer


class _TorchLayer(Layer, ABC):
    _api_package: str = ...

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        assert hasattr(
            self._api_package,
            self._api_name
        ), f"could not find {self._api_name} in {self._api_package}"
        api = getattr(self._api_package, self._api_name)

        if inspect.isclass(api) and issubclass(api, torch.nn.Module):
            self._api_init_func = api.__init__
            self._api_forward_func = api.forward
        elif inspect.isfunction(api) or inspect.ismethod(api) or inspect.isbuiltin(api):
            self._api_forward_func = api
        else:
            raise NotImplementedError(
                f"unexpected object get from {self._api_package}.{self._api_name}, got {api}"
            )

    def init_code_rvalue(self, package: str = "") -> Tuple[str, ...]:
        raise NotImplementedError(
            "layer not support get init code's rvalue"
        )


class TorchNNLayer(_TorchLayer, ABC):
    _api_package = torch.nn

    def init_code_rvalue(self, package: str = "torch.nn") -> Tuple[str, ...]:
        init_params = self.get_contents(Layer.LayerContent)
        init_params = self._trim_params(init_params, self._api_init_func)
        init_params_str = ", ".join(f"{key}={repr(value)}" for key, value in init_params)
        package_name = f"{package}." if package and not package.endswith(".") else package
        return f"{package_name}{self._api_name}({init_params_str})",

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)


class TorchLayer(_TorchLayer, ABC):
    _api_package = torch

    def init_code(self, package: str = "", add_self: bool = True) -> Tuple[str, ...]:
        # those layers don't need to init
        return ()
