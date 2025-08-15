# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    'AvgPool1d',
    'AvgPool2d',
    'AvgPool3d',
]


class _AvgPool(TorchNNLayer):
    _api_name = ...

    data_amount = 1
    output_amount = 1

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    ceil_mode: Annotated[bool, Layer.LayerContent]
    count_include_pad: Annotated[bool, Layer.LayerContent]

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,
            padding: int | Tuple[int, ...] = 0,
            ceil_mode: bool = False,
            count_include_pad: bool = True,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)

        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.ceil_mode = ceil_mode
        self.count_include_pad = count_include_pad

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim as args.
        dim = kwargs['dim']

        return OutputShapeCalculator.pool(
            dim,
            self.kernel_size,
            self.padding,
            self.stride,
            return_indices=False,
            *input_shape,
        )


class AvgPool1d(_AvgPool):
    _api_name = "AvgPool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class AvgPool2d(_AvgPool):
    _api_name = "AvgPool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class AvgPool3d(_AvgPool):
    _api_name = "AvgPool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)
