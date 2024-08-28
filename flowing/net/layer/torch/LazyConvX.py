# Copyright © 2024 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

# not recommend using LazyXXX, which is no supported output_size()

__all__ = [
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

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        raise NotImplemented(
            f"_LazyConv does not support output_size for {self.layer_name}."
        )


class _LazyConvTranspose(_LazyConv):
    output_padding: int | Tuple[int, ...]

    data_amount = 1
    output_amount = 1

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"out_channels={self.out_channels}, kernel_size={self.kernel_size}, stride={self.stride}, "
                f"padding={self.padding}, padding_mode='{self.padding_mode}', dilation={self.dilation}, "
                f"groups={self.groups}, bias={self.bias}, output_padding={self.output_padding})")

    def output_size(self, input_size: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        raise NotImplemented(
            f"_LazyConvTranspose does not support output_size for {self.layer_name}."
        )


class LazyConv1d(_LazyConv):
    _api_name = "LazyConv1d"


class LazyConv2d(_LazyConv):
    _api_name = "LazyConv2d"


class LazyConv3d(_LazyConv):
    _api_name = "LazyConv3d"


class LazyConvTranspose1d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose1d"


class LazyConvTranspose2d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose2d"


class LazyConvTranspose3d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose3d"
