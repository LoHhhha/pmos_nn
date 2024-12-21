# Copyright © 2024 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Reshape'
]


class Reshape(Layer):
    _api_name = "Reshape"

    shape: Tuple[int, ...]
    __shape_mul: int = ...

    data_amount = 1
    output_amount = 1

    def __init__(self, output_shape, data_amount: int | None = None):
        self.shape = output_shape
        self.__shape_mul = reduce(lambda x, y: x * y, self.shape)

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
        return f"{self.output_name} = torch.reshape(input={self.output_name}, shape={self.shape})"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        if len(input_shape) != self.data_amount:
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}"
            )

        input_shape = input_shape[0]
        input_mul = reduce(lambda x, y: x * y, input_shape)

        neg_one_count = self.shape.count(-1)
        if neg_one_count > 1:
            raise ValueError(
                f"detect an unexpected Reshape, having more than one -1 as {self.shape}"
            )
        if neg_one_count:
            neg_one_idx = -1
            output_mul = 1
            for idx, num in enumerate(self.shape):
                if num < 0:
                    if num != -1:
                        raise ValueError(
                            f"detect an unexpected Reshape, having negative number, as {self.shape}"
                        )
                    else:
                        neg_one_idx = idx
                else:
                    output_mul *= num
            output_shape = list(self.shape)
            if output_mul > input_mul or input_mul % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected input_shape:{input_shape}, which cannot reshape to {self.shape}"
                )
            output_shape[neg_one_idx] = input_mul // output_mul
            return tuple(output_shape),

        if input_mul != self.__shape_mul:
            raise ValueError(
                f"detect a different shape as {input_shape}, expected to product as {self.__shape_mul}"
            )

        return tuple(self.shape),
