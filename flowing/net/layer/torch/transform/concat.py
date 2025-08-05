# Copyright © 2024-2025 PMoS. All rights reserved.

from abc import abstractmethod
from typing import Tuple, List, Annotated, Optional, Dict, Any

from flowing.net.layer import Layer
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
        prev_shape = None
        dim_sum = 0
        for shape in input_shape:
            shape = list(shape)
            if shape == [0, ]:
                continue

            try:
                dim_sum += shape[self.dim]
                shape[self.dim] = -1  # this dim can be different
            except IndexError:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"has so short shape than dim as  {self.dim}"
                )

            if prev_shape is not None and shape != prev_shape:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"which has different shapes"
                )
            if prev_shape is None:
                prev_shape = shape

        # mean that all is zero
        if prev_shape is None:
            return (0,),

        prev_shape[self.dim] = dim_sum
        return tuple(prev_shape),


class Stack(_Concat):
    _api_name = "stack"

    @Layer.input_shape_check_wrap
    @Layer.data_amount_not_zero_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        prev_shape = None
        for shape in input_shape:
            shape = list(shape)

            if prev_shape is not None and shape != prev_shape:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"has different shapes"
                )
            if prev_shape is None:
                prev_shape = shape

        # after data_amount_not_zero_check, prev_shape cannot be None

        padding_num = -1
        result_shape = [padding_num] * (len(prev_shape) + 1)
        try:
            result_shape[self.dim] = len(input_shape)
        except IndexError:
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}, "
                f"expected it's item has at least {self.dim + 1} dimensions for dim as {self.dim}"
            )

        rs_idx = 0
        for idx in range(len(prev_shape)):
            while result_shape[rs_idx] != padding_num:
                rs_idx += 1
            result_shape[rs_idx] = prev_shape[idx]
            rs_idx += 1

        return tuple(result_shape),
