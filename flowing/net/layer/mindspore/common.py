# Copyright © 2025 PMoS. All rights reserved.

import inspect
import warnings
from abc import ABC
from typing import Dict, Any, Tuple

from flowing.shower import Logger
from flowing.net.layer import Layer

try:
    import mindspore
    import mindspore.nn
except ImportError:
    warnings.warn(f"mindspore not found, mindspore operator's support is limited")
    mindspore = None


class _MindSporeLayer(Layer, ABC):
    _api_package = ...

    def _set_api(self):
        if mindspore is None:
            return

        api = getattr(self._api_package, self._api_name, None)
        if api is None:
            Logger.warning(f"could not find {self._api_name} in {self._api_package}")
            return

        if inspect.isclass(api) and issubclass(api, mindspore.nn.Cell):
            self._api_init_func = api.__init__
            self._api_forward_func = api.construct
        elif inspect.isfunction(api) or inspect.ismethod(api) or inspect.isbuiltin(api):
            self._api_forward_func = api
        else:
            Logger.warning(
                f"unexpected object get from {self._api_package}.{self._api_name}, got {api}"
            )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._set_api()


class MindSporeNNLayer(_MindSporeLayer, ABC):
    _api_package = mindspore.nn if mindspore is not None else None

    def init_code(
            self,
            package: str = "mindspore.nn",
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


class MindSporeOpsLayer(_MindSporeLayer, ABC):
    _api_package = mindspore.ops if mindspore is not None else None

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
