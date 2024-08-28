# Copyright © 2024 PMoS. All rights reserved.

import math
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'MaxPool1d',
    'MaxPool2d',
    'MaxPool3d',
]


class _MaxPool(Layer):
    kernel_size: int | Tuple[int, ...]
    stride: int | Tuple[int, ...]
    padding: int | Tuple[int, ...]
    dilation: int | Tuple[int, ...]
    return_indices: bool
    ceil_mode: bool

    data_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            dilation: int | Tuple[int, ...] = 1,
            return_indices: bool = False,
            ceil_mode: bool = False,
            data_amount: int | None = None,
    ):
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.dilation = dilation
        self.return_indices = return_indices
        self.ceil_mode = ceil_mode

        self._set_data(data_amount=data_amount)

        if self.return_indices is True:
            self.output_amount = 2
        else:
            self.output_amount = 1

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding}, "
                f"dilation={self.dilation}, return_indices={self.return_indices}, ceil_mode={self.ceil_mode})")

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        # need dim as args.
        dim = kwargs['dim']

        if len(input_size) not in (dim + 1, dim + 2):
            raise ValueError(
                f"Expected {dim + 1}D (unbatched) or {dim + 2}D (batched) input to {self._api_name}, "
                f"but got input of size: {input_size}"
            )

        if isinstance(self.kernel_size, int):
            kernel_size = (self.kernel_size,) * dim
        else:
            kernel_size = self.kernel_size

        if isinstance(self.padding, int):
            padding = (self.padding,) * dim
        else:
            padding = self.padding

        if self.stride is None:
            stride = kernel_size
        elif isinstance(self.stride, int):
            stride = (self.stride,) * dim
        else:
            stride = self.stride

        if isinstance(self.dilation, int):
            dilation = (self.dilation,) * dim
        else:
            dilation = self.dilation

        output_size = [size for size in input_size]

        for i in range(dim):
            output_size[-dim + i] = math.floor(
                (input_size[-dim + i] + 2 * padding[i] - dilation[i] * (kernel_size[i] - 1) - 1) / stride[i] + 1
            )

        return tuple(output_size)


class MaxPool1d(_MaxPool):
    _api_name = "MaxPool1d"

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_size(input_size, dim=1)


class MaxPool2d(_MaxPool):
    _api_name = "MaxPool2d"

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_size(input_size, dim=2)


class MaxPool3d(_MaxPool):
    _api_name = "MaxPool3d"

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_size(input_size, dim=3)
