# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional

from flowing.net.layer import Layer

__all__ = [
    'MaxUnpool1d',
    'MaxUnpool2d',
    'MaxUnpool3d',
]


class _MaxUnpool(Layer):
    kernel_size: int | Tuple[int, ...]
    stride: Optional[int | Tuple[int, ...]]
    padding: int | Tuple[int, ...]

    data_amount = 2
    output_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            data_amount: int | None = None,
    ):
        super().__init__(data_amount=data_amount)
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding})"),

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim as args.
        dim = kwargs['dim']

        data_shape, info_shape = input_shape

        if tuple(data_shape) != tuple(info_shape):
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}, expected both of shapes should be same."
            )

        if len(data_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"Expected {dim + 1}D (unbatched) or {dim + 2}D (batched) input to {self._api_name}, "
                f"but got input of size: {data_shape}"
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

        output_shape = list(data_shape)

        for i in range(dim):
            output_shape[-dim + i] = (data_shape[-dim + i] - 1) * stride[i] - 2 * padding[i] + kernel_size[i]

        return tuple(output_shape),


class MaxUnpool1d(_MaxUnpool):
    _api_name = "MaxUnpool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class MaxUnpool2d(_MaxUnpool):
    _api_name = "MaxUnpool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class MaxUnpool3d(_MaxUnpool):
    _api_name = "MaxUnpool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)
