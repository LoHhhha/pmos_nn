# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    'Flatten',
    'Unflatten',
]


class Flatten(MindSporeNNLayer):
    _api_name = "Flatten"

    start_dim: Annotated[int, Layer.LayerContent]
    end_dim: Annotated[int, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, start_dim: int = 1, end_dim: int = -1, **kwargs):
        super().__init__(**kwargs)
        self.start_dim = start_dim
        self.end_dim = end_dim

    def content_check(self):
        if (self.start_dim > self.end_dim and min(self.start_dim, self.end_dim) >= 0) or \
                (self.start_dim < self.end_dim and max(self.start_dim, self.end_dim) < 0):
            raise ValueError(
                f"detected an unexpected start_dim as {self.start_dim} and end_dim as {self.end_dim}, "
                f"expecting start_dim in front of end_dim"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.flatten(
            self.start_dim,
            self.end_dim,
            *input_shape,
        )


class Unflatten(MindSporeNNLayer):
    _api_name = "Unflatten"

    axis: Annotated[int, Layer.LayerContent]
    unflattened_size: Annotated[Tuple[int, ...], Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, axis: int, unflattened_size: Tuple[int, ...], **kwargs):
        super().__init__(**kwargs)
        self.axis = axis
        self.unflattened_size = unflattened_size

    def content_check(self):
        negs = [x for x in self.unflattened_size if x < 0]

        if len(negs) > 1:
            raise ValueError(
                f"detected an unexpected unflattened_size as {self.unflattened_size}, "
                f"expecting haven't more than one negative number"
            )

        if negs.count(-1) != len(negs):
            raise ValueError(
                f"detected an unexpected unflattened_size as {self.unflattened_size}, "
                f"expecting only contains -1"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.unflatten(
            self.axis,
            self.unflattened_size,
            *input_shape,
        )
