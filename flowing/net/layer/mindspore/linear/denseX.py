# Copyright © 2025 PMoS. All rights reserved.

from abc import ABC
from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    'Dense',
    'BiDense',
]


class _Dense(MindSporeNNLayer, ABC):
    out_channels: Annotated[int, Layer.LayerContent]
    has_bias: Annotated[bool, Layer.LayerContent]

    output_amount = 1

    def __init__(self, out_channels: int, has_bias: bool = True, **kwargs):
        super().__init__(**kwargs)

        self.out_channels = out_channels
        self.has_bias = has_bias


class Dense(_Dense):
    _api_name = "Dense"

    in_channels: Annotated[int, Layer.LayerContent]

    data_amount = 1

    def __init__(self, in_channels: int, **kwargs):
        super().__init__(**kwargs)
        self.in_channels = in_channels

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.linear(
            self.in_channels,
            self.out_channels,
            *input_shape
        )


class BiDense(_Dense):
    _api_name = "BiDense"

    in1_channels: Annotated[int, Layer.LayerContent]
    in2_channels: Annotated[int, Layer.LayerContent]

    data_amount = 2

    def __init__(self, in1_channels: int, in2_channels: int, **kwargs):
        super().__init__(**kwargs)

        self.in1_channels = in1_channels
        self.in2_channels = in2_channels

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.bilinear(
            self.in1_channels,
            self.in2_channels,
            self.out_channels,
            *input_shape
        )
