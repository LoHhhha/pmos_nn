# Copyright © 2024-2025 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List, Annotated

from flowing.net.layer import Layer

__all__ = [
    'Reshape'
]


class Reshape(Layer):
    _api_name = "Reshape"

    shape: Annotated[Tuple[int, ...], Layer.LayerContent]

    __shape_mul: int = ...

    data_amount = 1
    output_amount = 1

    def __init__(self, output_shape, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)
        self.shape = output_shape
        self.__shape_mul = reduce(lambda x, y: x * y, self.shape)

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return f"{self.output_name} = torch.reshape(input={self.data_names[0]}, shape={self.shape})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = input_shape[0]
        input_mul = reduce(lambda x, y: x * y, input_shape)

        neg_one_count = self.shape.count(-1)
        if neg_one_count > 1:
            raise ValueError(
                f"detect an unexpected Reshape, having more than one -1 as {self.shape}"
            )
        if neg_one_count:
            neg_idx = -1
            output_mul = 1
            for idx, num in enumerate(self.shape):
                if num < 0:
                    if num != -1:
                        raise ValueError(
                            f"detect an unexpected Reshape, having negative number, as {self.shape}"
                        )
                    else:
                        neg_idx = idx
                else:
                    output_mul *= num
            output_shape = list(self.shape)
            if output_mul > input_mul or input_mul % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected input_shape:{input_shape}, which cannot reshape to {self.shape}"
                )
            output_shape[neg_idx] = input_mul // output_mul
            return tuple(output_shape),

        if input_mul != self.__shape_mul:
            raise ValueError(
                f"detect a different shape as {input_shape}, expected to product as {self.__shape_mul}"
            )

        return tuple(self.shape),
