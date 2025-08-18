# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.common import MindSporeNNLayer
from flowing.net.layer.shape_helper import OutputShapeCalculator, DataShapeChecker


class _SimpleActivation(MindSporeNNLayer):
    data_amount = 1
    output_amount = 1

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.same_as_input_shape(*input_shape)


class _AxisActivation(_SimpleActivation):
    axis: Annotated[int, Layer.LayerContent]

    def __init__(self, axis: int = -1, **kwargs):
        super().__init__(**kwargs)

        self.axis = axis

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        result = super().output_shape(*input_shape, **kwargs)

        # check if dim exist in input_shape
        for shape in input_shape:
            DataShapeChecker.exist_dim(shape, self.axis)

        return result


class _AlphaActivation(_SimpleActivation):
    alpha: Annotated[Optional[float], Layer.LayerContent]

    def __init__(self, alpha: float = 1.0, **kwargs):
        super().__init__(**kwargs)

        self.alpha = alpha


class _LambdActivation(_SimpleActivation):
    lambd: Annotated[float, Layer.LayerContent]

    def __init__(self, lambd: float = 0.5, **kwargs):
        super().__init__(**kwargs)

        self.lambd = lambd
