# Copyright © 2024 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Reshape'
]

class Reshape(Layer):
    _api_name = "Reshape"

    output_shape: Tuple[int, ...]
    __output_shape_mul: int = ...

    data_amount = 1
    output_amount = 1

    def __init__(self, output_shape, data_amount: int | None = None):
        self.output_shape = output_shape
        self.__output_shape_mul = reduce(lambda x, y: x * y, self.output_shape)

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return None

    def forward_code(self, add_self: bool = False):
        # add_self is useless

        if self.output_name is ... or self.data_names is ...:
            raise NotImplementedError(
                "please first assign the Layer.output_name and Layer.data_name before you call "
                "Layer.forward_code()"
            )
        return f"{self.output_name} = torch.reshape(input={self.output_name}, shape={self.output_shape})"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        input_mul = reduce(lambda x, y: x * y, input_shape)

        if input_mul != self.__output_shape_mul:
            return tuple()
        return tuple(self.output_shape)
