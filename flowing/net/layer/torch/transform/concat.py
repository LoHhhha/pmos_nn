# Copyright © 2024-2025 PMoS. All rights reserved.

from abc import abstractmethod
from typing import Tuple, List, Annotated, Optional, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    "Cat",
    "Stack"
]


class _Concat(TorchLayer):
    _api_name = ...

    dim: Annotated[int, Layer.LayerForwardContent]

    output_amount = 1

    def __init__(
            self,
            dim: int = 0,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.dim = dim

    @Layer.injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        args = self.get_forward_args(
            extend_params=self.get_contents(Layer.LayerForwardContent),
            data_names_as_tuple=True,
            data_names_identifiers=["tensors"],
        )
        right_value = f"torch.{self._api_name}({args})"

        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    @abstractmethod
    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        ...


class Cat(_Concat):
    _api_name = "cat"

    @Layer.input_shape_check_wrap
    @Layer.data_amount_not_zero_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.concat(
            self.dim,
            *input_shape,
        )


class Stack(_Concat):
    _api_name = "stack"

    @Layer.input_shape_check_wrap
    @Layer.data_amount_not_zero_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.stack(
            self.dim,
            *input_shape,
        )
