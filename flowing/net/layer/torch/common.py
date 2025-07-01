# Copyright © 2025 PMoS. All rights reserved.

import inspect
from abc import ABC

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


class TorchNNLayer(_TorchLayer, ABC):
    _api_package = torch.nn


class TorchLayer(_TorchLayer, ABC):
    _api_package = torch
