# Copyright © 2024 PMoS. All rights reserved.

from functools import reduce
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
        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return None

    def forward_code(self, add_self: bool = True):
        # add_self is useless

        if self.output_name is ... or self.data_names is ...:
            raise NotImplementedError(
                "please first assign the Layer.output_name and Layer.data_name before you call "
                "Layer.forward_code()"
            )
        return f"{self.output_name} = {self._get_args(block=f' {self.operation} ')}"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        if self.data_amount == 0:
            raise ValueError(
                f"detect an unexpected no input _Operation"
            )

        if len(input_shape) != self.data_amount:
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}"
            )

        prev = tuple(input_shape[0])
        for shape in input_shape:
            if tuple(shape) != prev:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, has different shape"
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
