# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.utils import get_and_check_target_dim_param

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


class _LazyConv(TorchNNLayer):
    _dim: int

    out_channels: Annotated[int, Layer.LayerContent]
    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...] | str, Layer.LayerContent]
    padding_mode: Annotated[str, Layer.LayerContent]
    dilation: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    groups: Annotated[int, Layer.LayerContent]
    bias: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            out_channels: int,
            kernel_size: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] = 1,
            padding: int | Tuple[int, ...] | str = 0,
            padding_mode: str = 'zeros',
            dilation: int | Tuple[int, ...] = 1,
            groups: int = 1,
            bias: bool = True,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.padding_mode = padding_mode
        self.dilation = dilation
        self.groups = groups
        self.bias = bias

    def content_check(self):
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "kernel_size")
        stride = get_and_check_target_dim_param(self.stride, self._dim, 1, "stride")
        _ = get_and_check_target_dim_param(self.dilation, self._dim, 0, "dilation")

        if isinstance(self.padding, str):
            if self.padding == 'valid':
                pass
            elif self.padding == 'same':
                if stride.count(1) != self._dim:
                    raise ValueError(
                        f"detect an unexpected padding as {self.padding} or stride as {self.stride}, "
                        f"expected stride should all be 1 when padding is 'same'"
                    )
            else:
                raise ValueError(
                    f"detect an unexpected padding as {self.padding}, "
                    f"expected padding must be one of 'same', 'valid' when padding is str type"
                )
        else:
            # int/tuple
            _ = get_and_check_target_dim_param(self.padding, self._dim, 0, "padding")

        if self.padding_mode not in ('zeros', 'reflect', 'replicate', 'circular'):
            raise ValueError(
                f"detect an unexpected padding_mode as {self.padding_mode}, "
                f"expected padding_mode must be one of 'zeros', 'reflect', 'replicate', 'circular'"
            )

        if self.out_channels % self.groups != 0:
            raise ValueError(
                f"detect an unexpected out_channels as {self.out_channels} or groups as {self.groups}, "
                f"expected out_channels can be divisible by groups"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim and output_padding as args.
        in_channels = kwargs.get('in_channels', None)
        output_padding = kwargs.get('output_padding', None)

        return OutputShapeCalculator.convolution(
            self._dim,
            in_channels,
            self.out_channels,
            self.kernel_size,
            self.padding,
            self.stride,
            self.dilation,
            output_padding,
            self.groups,
            False,
            *input_shape,
        )


class _LazyConvTranspose(_LazyConv):
    output_padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding

    def content_check(self):
        _ = get_and_check_target_dim_param(self.output_padding, self._dim, 0, "output_padding")

        if isinstance(self.padding, str):
            raise ValueError(
                f"detect an unexpected padding as {self.padding}, "
                f"expected padding should be int or tuple"
            )


class _Conv(_LazyConv):
    in_channels: Annotated[int, Layer.LayerContent]

    def __init__(self, in_channels: int, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.in_channels = in_channels

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, in_channels=self.in_channels, **kwargs)

    def content_check(self):
        if self.in_channels % self.groups != 0:
            raise ValueError(
                f"detect an unexpected in_channels as {self.in_channels} or groups as {self.groups}, "
                f"expected in_channels can be divisible by groups"
            )


class _ConvTranspose(_Conv):
    output_padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding

    def content_check(self):
        _ = get_and_check_target_dim_param(self.output_padding, self._dim, 0, "output_padding")

        if isinstance(self.padding, str):
            raise ValueError(
                f"detect an unexpected padding as {self.padding}, "
                f"expected padding should be int or tuple"
            )


class LazyConv1d(_LazyConv):
    _api_name = "LazyConv1d"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class LazyConv2d(_LazyConv):
    _api_name = "LazyConv2d"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class LazyConv3d(_LazyConv):
    _api_name = "LazyConv3d"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class LazyConvTranspose1d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose1d"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)


class LazyConvTranspose2d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose2d"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)


class LazyConvTranspose3d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose3d"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)


class Conv1d(_Conv):
    _api_name = "Conv1d"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class Conv2d(_Conv):
    _api_name = "Conv2d"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class Conv3d(_Conv):
    _api_name = "Conv3d"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class ConvTranspose1d(_ConvTranspose):
    _api_name = "ConvTranspose1d"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)


class ConvTranspose2d(_ConvTranspose):
    _api_name = "ConvTranspose2d"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)


class ConvTranspose3d(_ConvTranspose):
    _api_name = "ConvTranspose3d"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)
