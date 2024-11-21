# Copyright © 2024 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Flatten',
    'Unflatten',
]


class Flatten(Layer):
    _api_name = "Flatten"

    start_dim: int
    end_dim: int

    data_amount = 1
    output_amount = 1

    def __init__(self, start_dim: int = 1, end_dim: int = -1, data_amount: int | None = None):
        self.start_dim = start_dim
        self.end_dim = end_dim

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"start_dim={self.start_dim}, end_dim={self.end_dim})")

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        input_shape = list(input_shape)
        output_shape = []
        start_dim = self.start_dim if self.start_dim >= 0 else len(input_shape) + self.start_dim
        if start_dim < 0 or start_dim >= len(input_shape):
            raise ValueError(
                f"Expected start_dim should be a index of input_shape, "
                f"but got start_dim={self.start_dim} and input_shape={input_shape}"
            )
        end_dim = self.end_dim if self.end_dim >= 0 else len(input_shape) + self.end_dim
        if end_dim < 0 or end_dim >= len(input_shape):
            raise ValueError(
                f"Expected end_dim should be a index of input_shape, "
                f"but got end_dim={self.end_dim} and input_shape={input_shape}"
            )
        if start_dim > end_dim:
            raise ValueError(
                f"start_dim={self.start_dim} which is greater than end_dim={self.end_dim}"
            )
        mul = 1
        for dim, num in enumerate(input_shape):
            if dim < start_dim:
                output_shape.append(num)
            elif dim <= end_dim:
                mul *= num
            else:
                if mul != -1:
                    output_shape.append(mul)
                    mul = -1
                output_shape.append(num)
        if mul != -1:
            output_shape.append(mul)
        return tuple(output_shape)


class Unflatten(Layer):
    _api_name = "Unflatten"

    dim: int
    unflattened_size: Tuple[int, ...]
    __unflattened_size_mul: int

    data_amount = 1
    output_amount = 1

    def __init__(self, dim: int, unflattened_size: Tuple[int, ...], data_amount: int | None = None) -> None:
        self.dim = dim
        self.unflattened_size = unflattened_size
        self.__unflattened_size_mul = reduce(lambda x, y: x * y, unflattened_size)

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"dim={self.dim}, unflattened_size={self.unflattened_size})")

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        input_shape = list(input_shape)

        dim = self.dim if self.dim >= 0 else len(input_shape) + self.dim
        if dim < 0 or dim >= len(input_shape):
            raise ValueError(
                f"Expected dim should be a index of input_shape, "
                f"but got dim={self.dim} and input_shape={input_shape}"
            )

        if input_shape[dim] != self.__unflattened_size_mul:
            raise ValueError(
                f"Expected input_shape[dim] should be {self.__unflattened_size_mul} , "
                f"but got dim={self.dim} and input_shape={input_shape}"
            )

        input_shape[dim:dim + 1] = self.unflattened_size
        return tuple(input_shape)
