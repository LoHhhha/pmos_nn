# Copyright © 2024-2025 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List, Annotated, Optional

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

    def __init__(self, start_dim: int = 1, end_dim: int = -1, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.start_dim = start_dim
        self.end_dim = end_dim

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = list(input_shape[0])
        output_shape = []
        start_dim = self.start_dim if self.start_dim >= 0 else len(data_shape) + self.start_dim
        if start_dim < 0 or start_dim >= len(data_shape):
            raise ValueError(
                f"detect an unexpected data_shape:{data_shape}, "
                f"expected start_dim as {self.start_dim} should be a index of data_shape"
            )
        end_dim = self.end_dim if self.end_dim >= 0 else len(data_shape) + self.end_dim
        if end_dim < 0 or end_dim >= len(data_shape):
            raise ValueError(
                f"detect an unexpected data_shape:{data_shape}, "
                f"expected end_dim as {self.end_dim} should be a index of data_shape as {data_shape}"
            )
        if start_dim > end_dim:
            raise ValueError(
                f"detect an unexpected Flatten params, "
                f"start_dim as {self.start_dim} which is greater than end_dim as {self.end_dim}"
            )
        mul = 1
        for dim, num in enumerate(data_shape):
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

    def __init__(self, dim: int, unflattened_size: Tuple[int, ...], data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.dim = dim
        self.unflattened_size = unflattened_size
        self.__unflattened_size_mul = reduce(lambda x, y: x * y, unflattened_size)

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = list(input_shape[0])

        neg_count = len([x for x in self.unflattened_size if x < 0])
        if neg_count > 1:
            raise ValueError(
                f"detect an unexpected Unflatten params unflattened_size as {self.unflattened_size}, "
                f"having more than one negative number"
            )

        dim = self.dim if self.dim >= 0 else len(data_shape) + self.dim
        if dim < 0 or dim >= len(data_shape):
            raise ValueError(
                f"detect an unexpected data_shape:{data_shape}, "
                f"expected dim as {self.dim} should be a index of data_shape"
            )

        if neg_count:
            neg_idx = -1
            output_mul = 1
            for idx, num in enumerate(self.unflattened_size):
                if num < 0:
                    if num != -1:
                        raise ValueError(
                            f"detect an unexpected Unflatten params unflattened_size as {self.unflattened_size}, "
                            f"having negative number but not -1"
                        )
                    else:
                        neg_idx = idx
                else:
                    output_mul *= num
            output_shape = list(self.unflattened_size)
            if output_mul > data_shape[dim] or output_mul == 0 or data_shape[dim] % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected data_shape:{data_shape}, "
                    f"which NO.{self.dim} dimension cannot unflatten to {self.unflattened_size}"
                )
            output_shape[neg_idx] = data_shape[dim] // output_mul
            data_shape[dim:dim + 1] = output_shape
            return tuple(data_shape),

        if data_shape[dim] != self.__unflattened_size_mul:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape's NO.{dim + 1} dimension should be {self.__unflattened_size_mul}"
            )

        data_shape[dim:dim + 1] = self.unflattened_size
        return tuple(data_shape),
