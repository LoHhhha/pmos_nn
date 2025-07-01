# Copyright © 2024-2025 PMoS. All rights reserved.

import math
from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.torch.utils import get_and_check_target_dim_param

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

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim and output_padding as args.
        dim = kwargs['dim']
        output_padding = kwargs.get('output_padding', None)

        data_shape = input_shape[0]

        if len(data_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

        kernel_size = get_and_check_target_dim_param(self.kernel_size, dim, "kernel_size")
        padding = get_and_check_target_dim_param(self.padding, dim, "padding")
        stride = get_and_check_target_dim_param(self.stride, dim, "stride")
        dilation = get_and_check_target_dim_param(self.dilation, dim, "dilation")

        output_shape = [data_shape[0]] * len(data_shape)
        # this maybe out_channels or N
        output_shape[-dim - 1] = self.out_channels

        if output_padding is None:
            for i in range(dim):
                output_shape[-dim + i] = math.floor(
                    (data_shape[-dim + i] + 2 * padding[i] - dilation[i] * (kernel_size[i] - 1) - 1) / stride[i] + 1
                )
        else:
            if isinstance(output_padding, int):
                output_padding = (output_padding,) * dim
            for i in range(dim):
                output_shape[-dim + i] = \
                    (data_shape[-dim + i] - 1) * stride[i] - 2 * padding[i] + dilation[i] * (kernel_size[i] - 1) + \
                    output_padding[i] + 1

        return tuple(output_shape),


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

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim and output_padding as args.
        dim = kwargs['dim']

        data_shape = input_shape[0]

        # (N, C, ...)
        try:
            C_in = data_shape[-dim - 1]
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it have at least {dim + 1} dimensions"
            )
        if C_in != self.in_channels:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's {-dim - 1} dimensions is equal to in_channels as {self.in_channels}"
            )

        return super().output_shape(*input_shape, **kwargs)


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
