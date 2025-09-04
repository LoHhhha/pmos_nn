# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator, DataShapeChecker
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    "LayerNorm",
]


class LayerNorm(MindSporeNNLayer):
    _api_name = "LayerNorm"

    normalized_shape: Annotated[List[int], Layer.LayerContent]
    begin_norm_axis: Annotated[int, Layer.LayerContent]
    begin_params_axis: Annotated[int, Layer.LayerContent]
    epsilon: Annotated[float, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            normalized_shape: List[int] | Tuple[int, ...],
            begin_norm_axis: int = -1,
            begin_params_axis: int = -1,
            epsilon: float = 1e-7,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.normalized_shape = normalized_shape
        self.begin_norm_axis = begin_norm_axis
        self.begin_params_axis = begin_params_axis
        self.epsilon = epsilon

    def content_check(self):
        if len([val for val in self.normalized_shape if val <= 0]):
            raise ValueError(
                f"detected an unexpected normalized_shape as {self.normalized_shape}, "
                f"expecting it contains positive value"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]
        DataShapeChecker.exist_dim(data_shape, self.begin_params_axis)

        return OutputShapeCalculator.layer_norm(
            self.normalized_shape,
            self.begin_norm_axis,
            *input_shape,
        )
