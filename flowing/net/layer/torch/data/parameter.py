# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional, Dict, Any

try:
    import torch
except ImportError:
    torch = None

from flowing.net.layer import Layer
from flowing.net.layer.obj import IdentifierStr

__all__ = [
    "Parameter"
]


class Parameter(Layer):
    _api_name = "Parameter"

    _api_init_func = torch.nn.Parameter.__new__ if torch is not None else None

    data_size: Tuple[int, ...]  # isn't LayerContent
    requires_grad: Annotated[bool, Layer.LayerContent]

    data_amount = 0
    output_amount = 1

    @property
    def output_name(self):
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
            **kwargs
    ):
        super().__init__(**kwargs)
        self.data_size = data_size
        self.requires_grad = requires_grad

    def content_check(self):
        if len([val for val in self.data_size if val <= 0]):
            raise ValueError(
                f"detect an unexpected data_size as {self.data_size}, "
                f"expected it contains positive value"
            )

    def init_code(
            self,
            package: str = "torch.nn",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        # todo: now only supports using torch.randn to initial
        if extend_params is None:
            extend_params = {}
        extend_params["data"] = IdentifierStr(f"torch.randn({repr(self.data_size)})")
        return super().init_code(
            package=package,
            add_self=add_self,
            extend_params=extend_params,
            only_right_value=only_right_value,
        )

    @Layer.injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        if only_right_value:
            raise ValueError(
                "this Layer haven't forward code"
            )
        return ()

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(self.data_size),
