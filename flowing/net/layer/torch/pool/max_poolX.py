# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.utils import get_and_check_target_dim_param

__all__ = [
    'MaxPool1d',
    'MaxPool2d',
    'MaxPool3d',
]


class _MaxPool(TorchNNLayer):
    _api_name = ...

    _dim: int

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    dilation: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    return_indices: Annotated[bool, Layer.LayerContent]
    ceil_mode: Annotated[bool, Layer.LayerContent]

    data_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            dilation: int | Tuple[int, ...] = 1,
            return_indices: bool = False,
            ceil_mode: bool = False,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.dilation = dilation
        self.return_indices = return_indices
        self.ceil_mode = ceil_mode

        if self.return_indices:
            self.output_amount = 2
        else:
            self.output_amount = 1

    def content_check(self):
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "kernel_size")
        _ = get_and_check_target_dim_param(self.padding, self._dim, 0, "padding")
        _ = get_and_check_target_dim_param(
            self.kernel_size if self.stride is None else self.stride, self._dim, 1, "stride"
        )
        _ = get_and_check_target_dim_param(self.dilation, self._dim, 0, "dilation")

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.pool(
            self._dim,
            self.kernel_size,
            self.padding,
            self.stride,
            self.dilation,
            self.ceil_mode,
            self.return_indices,
            *input_shape,
        )


class MaxPool1d(_MaxPool):
    _api_name = "MaxPool1d"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class MaxPool2d(_MaxPool):
    _api_name = "MaxPool2d"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class MaxPool3d(_MaxPool):
    _api_name = "MaxPool3d"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)
