# Copyright © 2024 PMoS. All rights reserved.
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Add',
    'Subtract',
    'Multiply',
    'Divide',
]


class _Operation(Layer):
    output_amount = 1

    operation: str = ...

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

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return input_size


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
