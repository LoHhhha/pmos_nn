# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeNNLayer
from flowing.net.layer.utils import get_and_check_target_dim_param

__all__ = [
    'Conv1d',
    'Conv2d',
    'Conv3d',
    'Conv1dTranspose',
    'Conv2dTranspose',
    'Conv3dTranspose',
]


class _Conv(MindSporeNNLayer):
    _api_name = ...

    _dim: int

    in_channels: Annotated[int, Layer.LayerContent]
    out_channels: Annotated[int, Layer.LayerContent]
    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    pad_mode: Annotated[str, Layer.LayerContent]
    dilation: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    group: Annotated[int, Layer.LayerContent]
    has_bias: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            in_channels: int,
            out_channels: int,
            kernel_size: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] = 1,
            padding: int | Tuple[int, ...] = 0,
            pad_mode: str = 'same',
            dilation: int | Tuple[int, ...] = 1,
            group: int = 1,
            has_bias: bool = False,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.pad_mode = pad_mode
        self.dilation = dilation
        self.group = group
        self.has_bias = has_bias

    def content_check(self):
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "kernel_size")
        _ = get_and_check_target_dim_param(self.stride, self._dim, 1, "stride")
        _ = get_and_check_target_dim_param(self.dilation, self._dim, 0, "dilation")

        if self.pad_mode == "same":
            if self.padding != 0:
                raise ValueError(
                    f"detected an unexpected padding as {self.padding} or pad_mode as {self.pad_mode}, "
                    f"expecting padding should be 1 when pad_mode is 'same'"
                )
        elif self.pad_mode == "valid":
            if self.padding != 0:
                raise ValueError(
                    f"detected an unexpected padding as {self.padding} or pad_mode as {self.pad_mode}, "
                    f"expecting padding should be 1 when pad_mode is 'valid'"
                )
        elif self.pad_mode == "pad":
            # each dim has 2 directions to padding
            _ = get_and_check_target_dim_param(self.padding, 2 * self._dim, 0, "padding")
        else:
            raise ValueError(
                f"detected an unexpected pad_mode as {self.pad_mode}, "
                f"expecting pad_mode should be one of 'pad', 'valid' or 'same'"
            )

        if self.in_channels % self.group != 0:
            raise ValueError(
                f"detected an unexpected in_channels as {self.in_channels} or group as {self.group}, "
                f"expecting in_channels can be divisible by group"
            )

        if self.out_channels % self.group != 0:
            raise ValueError(
                f"detected an unexpected out_channels as {self.out_channels} or group as {self.group}, "
                f"expecting out_channels can be divisible by group"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need output_padding as args.
        output_padding = kwargs.get('output_padding', None)

        # mindspore only support (N, C, ...)
        data_shape = input_shape[0]
        if len(data_shape) != (self._dim + 2):
            raise ValueError(
                f"detected an unexpected data_shape as {data_shape}, "
                f"expecting data_shape has {self._dim + 2} dimension"
            )

        return OutputShapeCalculator.convolution(
            self._dim,
            self.in_channels,
            self.out_channels,
            self.kernel_size,
            self.padding if self.pad_mode == 'pad' else self.pad_mode,
            self.stride,
            self.dilation,
            output_padding,
            self.group,
            True,
            *input_shape,
        )


class _ConvTranspose(_Conv):
    _api_name = ...

    output_padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    def __init__(self, output_padding: int | Tuple[int, ...] = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.output_padding = output_padding

    def content_check(self):
        output_padding = get_and_check_target_dim_param(
            self.output_padding, self._dim, 0, "output_padding"
        )
        if len([val for val in output_padding if val is not None and val > 0]) and (self.pad_mode != 'pad'):
            raise ValueError(
                f"detected an unexpected pad_mode as {self.pad_mode} or output_padding as {self.output_padding}, "
                f"expecting pad_mode should be 'pad' when output_padding > 0"
            )


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


class Conv1dTranspose(_Conv):
    # mindspore Conv1dTranspose not have output_padding param, so using _Conv
    _api_name = "Conv1dTranspose"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=0)


class Conv2dTranspose(_ConvTranspose):
    _api_name = "Conv2dTranspose"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)


class Conv3dTranspose(_ConvTranspose):
    _api_name = "Conv3dTranspose"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, output_padding=self.output_padding)
