# Copyright © 2024 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'MaxUnpool1d',
    'MaxUnpool2d',
    'MaxUnpool3d',
]


class _MaxUnpool(Layer):
    kernel_size: int | Tuple[int, ...]
    stride: int | Tuple[int, ...]
    padding: int | Tuple[int, ...]

    data_amount = 2
    output_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            data_amount: int | None = None,
    ):
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding})")

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

        output_size = [size for size in input_size]

        for i in range(dim):
            output_size[-dim + i] = (input_size[-dim + i] - 1) * stride[i] - 2 * padding[i] + kernel_size[i]

        return tuple(output_size)


class MaxUnpool1d(_MaxUnpool):
    _api_name = "MaxUnpool1d"

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_size(input_size, dim=1)


class MaxUnpool2d(_MaxUnpool):
    _api_name = "MaxUnpool2d"

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_size(input_size, dim=2)


class MaxUnpool3d(_MaxUnpool):
    _api_name = "MaxUnpool3d"

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_size(input_size, dim=3)
