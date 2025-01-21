# Copyright © 2024-2025 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List, Annotated

from flowing.net.layer import Layer

__all__ = [
    'Flatten',
    'Unflatten',
]


class Flatten(Layer):
    _api_name = "Flatten"

    start_dim: Annotated[int, Layer.LayerContent]
    end_dim: Annotated[int, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, start_dim: int = 1, end_dim: int = -1, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)
        self.start_dim = start_dim
        self.end_dim = end_dim

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = list(input_shape[0])
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
        return tuple(output_shape),


class Unflatten(Layer):
    _api_name = "Unflatten"

    dim: Annotated[int, Layer.LayerContent]
    unflattened_size: Annotated[Tuple[int, ...], Layer.LayerContent]
    __unflattened_size_mul: Annotated[int, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, dim: int, unflattened_size: Tuple[int, ...], data_amount: int | None = None):
        super().__init__(data_amount=data_amount)
        self.dim = dim
        self.unflattened_size = unflattened_size
        self.__unflattened_size_mul = reduce(lambda x, y: x * y, unflattened_size)

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = list(input_shape[0])

        neg_one_count = self.unflattened_size.count(-1)
        if neg_one_count > 1:
            raise ValueError(
                f"detect an unexpected Unflatten, having more than one -1 as {self.unflattened_size}"
            )

        dim = self.dim if self.dim >= 0 else len(input_shape) + self.dim
        if dim < 0 or dim >= len(input_shape):
            raise ValueError(
                f"Expected dim should be a index of input_shape, "
                f"but got dim={self.dim} and input_shape={input_shape}"
            )

        if neg_one_count:
            neg_idx = -1
            output_mul = 1
            for idx, num in enumerate(self.unflattened_size):
                if num < 0:
                    if num != -1:
                        raise ValueError(
                            f"detect an unexpected Unflatten, having negative number, as {self.unflattened_size}"
                        )
                    else:
                        neg_idx = idx
                else:
                    output_mul *= num
            output_shape = list(self.unflattened_size)
            if output_mul > input_shape[dim] or input_shape[dim] % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected input_shape:{input_shape}, which cannot unflatten to {self.unflattened_size}"
                )
            output_shape[neg_idx] = input_shape[dim] // output_mul
            input_shape[dim:dim + 1] = output_shape
            return tuple(input_shape),

        if input_shape[dim] != self.__unflattened_size_mul:
            raise ValueError(
                f"Expected input_shape[{dim}] should be {self.__unflattened_size_mul} , "
                f"but got input_shape={input_shape}"
            )

        input_shape[dim:dim + 1] = self.unflattened_size
        return tuple(input_shape),
