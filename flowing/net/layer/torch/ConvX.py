# Copyright © 2024 PMoS. All rights reserved.

import math
from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Conv1d',
    'Conv2d',
    'Conv3d',
    'ConvTranspose1d',
    'ConvTranspose2d',
    'ConvTranspose3d',
    'LazyConv1d',
    'LazyConv2d',
    'LazyConv3d',
    'LazyConvTranspose1d',
    'LazyConvTranspose2d',
    'LazyConvTranspose3d',
]


class _LazyConv(Layer):
    out_channels: int
    kernel_size: int | Tuple[int, ...]
    stride: int | Tuple[int, ...]
    padding: int | Tuple[int, ...]
    padding_mode: str
    dilation: int | Tuple[int, ...]
    groups: int
    bias: bool

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            out_channels: int,
            kernel_size: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] = 1,
            padding: int | Tuple[int, ...] = 0,
            padding_mode: str = 'zeros',
            dilation: int | Tuple[int, ...] = 1,
            groups: int = 1,
            bias: bool = True,
            data_amount: int | None = None,
    ):
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.padding_mode = padding_mode
        self.dilation = dilation
        self.groups = groups
        self.bias = bias

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"out_channels={self.out_channels}, kernel_size={self.kernel_size}, stride={self.stride}, "
                f"padding={self.padding}, padding_mode='{self.padding_mode}', dilation={self.dilation}, "
                f"groups={self.groups}, bias={self.bias})")

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        # need dim and output_padding as args.
        dim = kwargs['dim']
        output_padding = kwargs.get('output_padding', None)

        if len(input_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"Expected {dim + 1}D (unbatched) or {dim + 2}D (batched) input to {self._api_name}, "
                f"but got shape of input as: {input_shape}"
            )

        if isinstance(self.kernel_size, int):
            kernel_size = (self.kernel_size,) * dim
        else:
            kernel_size = self.kernel_size

        if isinstance(self.padding, int):
            padding = (self.padding,) * dim
        else:
            padding = self.padding

        if isinstance(self.stride, int):
            stride = (self.stride,) * dim
        else:
            stride = self.stride

        if isinstance(self.dilation, int):
            dilation = (self.dilation,) * dim
        else:
            dilation = self.dilation

        output_shape = [input_shape[0]] * len(input_shape)
        # this maybe out_channels or N
        output_shape[-dim - 1] = self.out_channels

        if output_padding is None:
            for i in range(dim):
                output_shape[-dim + i] = math.floor(
                    (input_shape[-dim + i] + 2 * padding[i] - dilation[i] * (kernel_size[i] - 1) - 1) / stride[i] + 1
                )
        else:
            if isinstance(output_padding, int):
                output_padding = (output_padding,) * dim
            for i in range(dim):
                output_shape[-dim + i] = \
                    (input_shape[-dim + i] - 1) * stride[i] - 2 * padding[i] + dilation[i] * (kernel_size[i] - 1) + \
                    output_padding[i] + 1

        return tuple(output_shape)


class _LazyConvTranspose(_LazyConv):
    output_padding: int | Tuple[int, ...]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"out_channels={self.out_channels}, kernel_size={self.kernel_size}, stride={self.stride}, "
                f"padding={self.padding}, padding_mode='{self.padding_mode}', dilation={self.dilation}, "
                f"groups={self.groups}, bias={self.bias}, output_padding={self.output_padding})")


class _Conv(_LazyConv):
    in_channels: int

    def __init__(self, in_channels: int, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.in_channels = in_channels

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (
            f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
            f"in_channels={self.in_channels}, out_channels={self.out_channels}, "
            f"kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding}, "
            f"padding_mode='{self.padding_mode}', dilation={self.dilation}, groups={self.groups}, bias={self.bias})"
        )

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        # need dim and output_padding as args.
        dim = kwargs['dim']

        # (N, C, ...)
        try:
            C_in = input_shape[-dim - 1]
        except IndexError:
            raise ValueError(
                f"Expected unexpected input_shape as {input_shape}, "
            )
        if C_in != self.in_channels:
            raise ValueError(
                f"Expected input_shape.C={self.in_channels}(as self.in_channels), but got input_shape.C={C_in}"
            )

        return super().output_shape(input_shape, **kwargs)


class _ConvTranspose(_Conv):
    output_padding: int | Tuple[int, ...]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"in_channels={self.in_channels}, out_channels={self.out_channels}, "
                f"kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding}, "
                f"padding_mode='{self.padding_mode}', dilation={self.dilation}, groups={self.groups}, "
                f"bias={self.bias}, output_padding={self.output_padding})")


class LazyConv1d(_LazyConv):
    _api_name = "LazyConv1d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=1)


class LazyConv2d(_LazyConv):
    _api_name = "LazyConv2d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=2)


class LazyConv3d(_LazyConv):
    _api_name = "LazyConv3d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=3)


class LazyConvTranspose1d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose1d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=1, output_padding=self.output_padding)


class LazyConvTranspose2d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose2d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=2, output_padding=self.output_padding)


class LazyConvTranspose3d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose3d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=1, output_padding=self.output_padding)


class Conv1d(_Conv):
    _api_name = "Conv1d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=1)


class Conv2d(_Conv):
    _api_name = "Conv2d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=2)


class Conv3d(_Conv):
    _api_name = "Conv3d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=3)


class ConvTranspose1d(_ConvTranspose):
    _api_name = "ConvTranspose1d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=1, output_padding=self.output_padding)


class ConvTranspose2d(_ConvTranspose):
    _api_name = "ConvTranspose2d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=2, output_padding=self.output_padding)


class ConvTranspose3d(_ConvTranspose):
    _api_name = "ConvTranspose3d"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return super().output_shape(input_shape, dim=3, output_padding=self.output_padding)
