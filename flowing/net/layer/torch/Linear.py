# Copyright © 2024 PMoS. All rights reserved.
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Linear',
]


class Linear(Layer):
    in_features: int
    out_features: int
    bias: bool

    _api_name = "Linear"

    data_amount = 1
    output_amount = 1

    def __init__(self, input_size: int, output_size: int, bias: bool = True, data_amount: int | None = None):
        self.input_size = input_size
        self.output_size = output_size
        self.bias = bias

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"input_size={self.input_size}, output_size={self.output_size}, bias={self.bias})")

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        output_size = [size for size in input_size]
        output_size[-1] = self.output_size
        return tuple(output_size)
