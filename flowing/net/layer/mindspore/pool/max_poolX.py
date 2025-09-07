# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.common import MindSporeNNLayer
from flowing.net.layer.mindspore.utils import mindspore_padding_check, mindspore_data_check
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.utils import get_and_check_target_dim_param, type_check

__all__ = [
    'MaxPool1d',
    'MaxPool2d',
    'MaxPool3d',
]


class _MaxPool(MindSporeNNLayer):
    _dim: int

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    pad_mode: Annotated[str, Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    dilation: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    return_indices: Annotated[bool, Layer.LayerContent]
    ceil_mode: Annotated[bool, Layer.LayerContent]

    data_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...] = 1,
            stride: int | Tuple[int, ...] = 1,
            pad_mode: str = "valid",
            padding: int | Tuple[int, ...] = 0,
            dilation: int | Tuple[int, ...] = 1,
            return_indices: bool = False,
            ceil_mode: bool = False,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.kernel_size = kernel_size
        self.stride = stride
        self.pad_mode = pad_mode
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
        _ = get_and_check_target_dim_param(self.padding, 2 * self._dim, 0, "padding")
        _ = get_and_check_target_dim_param(self.kernel_size, self._dim, 1, "stride")
        _ = get_and_check_target_dim_param(self.dilation, self._dim, 0, "dilation")

        mindspore_padding_check(self.pad_mode, self.padding, self._dim)

        if self._dim == 1:
            type_check(self.kernel_size, int, "kernel_size", self._api_name)
            type_check(self.stride, int, "stride", self._api_name)

        print(self)
        if self.pad_mode != "pad" and \
                (self.padding != 0 or self.dilation != 1 or self.return_indices or self.ceil_mode):
            raise ValueError(
                f"detected an unexpected pad_mode as {self.pad_mode}, "
                f"expected parameter 'padding', 'dilation', 'return_indices', 'ceil_mode' can not be set to "
                f"non-default value when pad_mode!='pad'"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        mindspore_data_check(input_shape[0], self._dim)

        return OutputShapeCalculator.pool(
            self._dim,
            self.kernel_size,
            self.padding if self.pad_mode == 'pad' else self.pad_mode,
            self.stride,
            self.dilation,
            self.ceil_mode,
            self.return_indices,
            *input_shape,
        )


class MaxPool1d(_MaxPool):
    _api_name = "MaxPool1d"

    _dim = 1


class MaxPool2d(_MaxPool):
    _api_name = "MaxPool2d"

    _dim = 2


class MaxPool3d(_MaxPool):
    _api_name = "MaxPool3d"

    _dim = 3
