# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.common import MindSporeNNLayer
from flowing.net.layer.mindspore.utils import mindspore_padding_check
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.utils import get_and_check_target_dim_param, type_check

__all__ = [
    'AvgPool1d',
    'AvgPool2d',
    'AvgPool3d',
]


class _AvgPool(MindSporeNNLayer):
    _dim: int

    data_amount = 1
    output_amount = 1

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    pad_mode: Annotated[str, Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    ceil_mode: Annotated[bool, Layer.LayerContent]
    count_include_pad: Annotated[bool, Layer.LayerContent]

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] = 1,
            pad_mode: str = "valid",
            padding: int | Tuple[int, ...] = 0,
            ceil_mode: bool = False,
            count_include_pad: bool = True,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.kernel_size = kernel_size
        self.stride = stride
        self.pad_mode = pad_mode
        self.padding = padding
        self.ceil_mode = ceil_mode
        self.count_include_pad = count_include_pad

    def content_check(self):
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "kernel_size")
        _ = get_and_check_target_dim_param(self.padding, 2 * self._dim, 0, "padding")
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "stride")

        mindspore_padding_check(self.pad_mode, self.padding, self._dim)

        if self._dim == 1:
            type_check(self.kernel_size, int, "kernel_size", self._api_name)
            type_check(self.stride, int, "stride", self._api_name)

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # avg pool supported batch and unbatch
        # mindspore_data_check(input_shape[0], self._dim)

        return OutputShapeCalculator.pool(
            self._dim,
            self.kernel_size,
            self.padding if self.pad_mode == 'pad' else self.pad_mode,
            self.stride,
            1,
            self.ceil_mode,
            False,
            *input_shape,
        )


class AvgPool1d(_AvgPool):
    _api_name = "AvgPool1d"

    _dim = 1


class _EAvgPool(_AvgPool):
    divisor_override: Annotated[Optional[int], Layer.LayerContent]

    def __init__(
            self,
            divisor_override: Optional[int] = None,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.divisor_override = divisor_override

    def content_check(self):
        if self.divisor_override is not None and self.divisor_override == 0:
            raise ValueError(
                f"detected an unexpected divisor_override as {self.divisor_override}, "
                f"expecting divisor_override!=0"
            )


class AvgPool2d(_EAvgPool):
    _api_name = "AvgPool2d"

    _dim = 2


class AvgPool3d(_EAvgPool):
    _api_name = "AvgPool3d"

    _dim = 3
