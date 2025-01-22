# Copyright © 2024-2025 PMoS. All rights reserved.

from abc import abstractmethod
from typing import Tuple, List, Annotated

from flowing.net.layer import Layer

__all__ = [
    "Cat",
    "Stack"
]


class _Concat(Layer):
    _api_name = ...

    dim: Annotated[int, Layer.LayerContent]

    output_amount = 1

    def __init__(
            self,
            dim: int = 0,
            data_amount: int | None = None
    ):
        super().__init__(data_amount=data_amount)
        self.dim = dim

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        # add_self is useless
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return (f"{self.output_name} = torch.{self._api_name}(tensors=({self.data_names[0]}, {self.data_names[1]}), "
                f"dim={self.dim})"),

    @abstractmethod
    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        ...


class Cat(_Concat):
    _api_name = "cat"

    @Layer.input_shape_check
    @Layer.data_amount_not_zero_check
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

    @Layer.input_shape_check
    @Layer.data_amount_not_zero_check
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
