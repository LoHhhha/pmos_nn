# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

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
    _api_name = ...

    out_channels: Annotated[int, Layer.LayerContent]
    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
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
            padding: int | Tuple[int, ...] = 0,
            padding_mode: str = 'zeros',
            dilation: int | Tuple[int, ...] = 1,
            groups: int = 1,
            bias: bool = True,
            data_amount: Optional[int] = None,
    ):
        super().__init__(data_amount=data_amount)
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.padding_mode = padding_mode
        self.dilation = dilation
        self.groups = groups
        self.bias = bias

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim and output_padding as args.
        dim = kwargs['dim']
        in_channels = kwargs.get('in_channels', None)
        output_padding = kwargs.get('output_padding', None)

        return OutputShapeCalculator.convolution(
            dim,
            in_channels,
            self.out_channels,
            self.kernel_size,
            self.padding,
            self.stride,
            self.dilation,
            output_padding,
            *input_shape,
        )


class _LazyConvTranspose(_LazyConv):
    _api_name = ...

    output_padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding


class _Conv(_LazyConv):
    _api_name = ...

    in_channels: Annotated[int, Layer.LayerContent]

    def __init__(self, in_channels: int, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.in_channels = in_channels

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, in_channels=self.in_channels, **kwargs)


class _ConvTranspose(_Conv):
    _api_name = ...

    output_padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding


class LazyConv1d(_LazyConv):
    _api_name = "LazyConv1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class LazyConv2d(_LazyConv):
    _api_name = "LazyConv2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class LazyConv3d(_LazyConv):
    _api_name = "LazyConv3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)


class LazyConvTranspose1d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1, output_padding=self.output_padding)


class LazyConvTranspose2d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2, output_padding=self.output_padding)


class LazyConvTranspose3d(_LazyConvTranspose):
    _api_name = "LazyConvTranspose3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1, output_padding=self.output_padding)


class Conv1d(_Conv):
    _api_name = "Conv1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class Conv2d(_Conv):
    _api_name = "Conv2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class Conv3d(_Conv):
    _api_name = "Conv3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)


class ConvTranspose1d(_ConvTranspose):
    _api_name = "ConvTranspose1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1, output_padding=self.output_padding)


class ConvTranspose2d(_ConvTranspose):
    _api_name = "ConvTranspose2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2, output_padding=self.output_padding)


class ConvTranspose3d(_ConvTranspose):
    _api_name = "ConvTranspose3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3, output_padding=self.output_padding)
