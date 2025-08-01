# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

import torch

from flowing.net.layer import Layer

__all__ = [
    "Parameter"
]


# todo: now only supports using torch.randn to initial
class Parameter(Layer):
    _api_name = "Parameter"

    _api_init_func = torch.nn.Parameter.__new__

    data_size: Tuple[int, ...]  # isn't LayerContent
    requires_grad: Annotated[bool, Layer.LayerContent]

    data_amount = 0
    output_amount = 1

    @property
    def output_name(self) -> str:
        if self.layer_name is ...:
            return ...
        return f"self.{self.layer_name}"

    @output_name.setter
    def output_name(self, value: str):
        pass

    def __init__(
            self,
            data_size: Tuple[int, ...],
            requires_grad: bool = False,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.data_size = data_size
        self.requires_grad = requires_grad

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        init_params = self.get_contents(Layer.LayerContent)
        init_params = self._trim_params(init_params, self._api_init_func)
        init_params_str = ", ".join(f"{key}={repr(value)}" for key, value in init_params)
        package_name = f"{package}." if package and not package.endswith(".") else package
        return (f"{"self." if add_self else ""}{self.layer_name} = {package_name}"
                f"{self._api_name}(torch.randn({repr(self.data_size)})"
                f"{", " + init_params_str if init_params_str else ""})"),

    @Layer.injected_check
    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return ()

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(self.data_size),
