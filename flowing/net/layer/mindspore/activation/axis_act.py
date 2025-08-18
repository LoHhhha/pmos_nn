# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.activation.common import _AxisActivation

__all__ = [
    'Softmax',
    'LogSoftmax',
    'Softmin',
    'GLU',
]


class Softmax(_AxisActivation):
    _api_name = "Softmax"


class LogSoftmax(_AxisActivation):
    _api_name = "LogSoftmax"


class Softmin(_AxisActivation):
    _api_name = "Softmin"


class GLU(_AxisActivation):
    _api_name = "GLU"

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.divide_input_shape(
            self.axis,
            2,
            *input_shape,
        )
