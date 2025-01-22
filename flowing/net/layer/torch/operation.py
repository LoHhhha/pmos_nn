# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Add',
    'Subtract',
    'Multiply',
    'Divide',
]


class _Operation(Layer):
    operation: str = ...

    output_amount = 1

    layer_name = "Useless"

    def __init__(self, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return ()

    def forward_code(self, add_self: bool = True) -> Tuple[str, ...]:
        # add_self is useless
        return f"{self.output_name} = {self.get_forward_args(block=f' {self.operation} ')}",

    @Layer.input_shape_check
    @Layer.data_amount_not_zero_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        prev = tuple(input_shape[0])
        for shape in input_shape:
            if tuple(shape) != prev:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"has different shapes"
                )
        return prev,


class Add(_Operation):
    _api_name = "Add"

    operation = "+"


class Subtract(_Operation):
    _api_name = "Subtract"

    operation = "-"


class Multiply(_Operation):
    _api_name = "Multiply"

    operation = "*"


class Divide(_Operation):
    _api_name = "Divide"

    operation = "/"
