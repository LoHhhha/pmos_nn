# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.utils import get_and_check_target_dim_param

__all__ = [
    'MaxUnpool1d',
    'MaxUnpool2d',
    'MaxUnpool3d',
]


class _MaxUnpool(TorchNNLayer):
    _api_name = ...

    _dim: int

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    data_amount = 2
    output_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding

    def content_check(self):
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "kernel_size")
        _ = get_and_check_target_dim_param(self.padding, self._dim, 0, "padding")
        _ = get_and_check_target_dim_param(
            self.kernel_size if self.stride is None else self.stride, self._dim, 1, "stride"
        )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.max_unpool(
            self._dim,
            self.kernel_size,
            self.padding,
            self.stride,
            *input_shape,
        )


class MaxUnpool1d(_MaxUnpool):
    _api_name = "MaxUnpool1d"

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class MaxUnpool2d(_MaxUnpool):
    _api_name = "MaxUnpool2d"

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)


class MaxUnpool3d(_MaxUnpool):
    _api_name = "MaxUnpool3d"

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape)
