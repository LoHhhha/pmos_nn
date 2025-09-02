# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    'Dropout',
    'Dropout1d',
    'Dropout2d',
    'Dropout3d',
]


class _Dropout(MindSporeNNLayer):
    _api_name = ...

    _dim: Optional[int] = None

    p: Annotated[float, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, p: float = 0.5, **kwargs):
        super().__init__(**kwargs)
        self.p = p

    def content_check(self):
        if self.p < 0 or self.p > 1:
            raise ValueError(
                f"detected an unexpected p as {self.p}, "
                f"expecting 0<=p<=1"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # mindspore only support (N, C, ...)
        data_shape = input_shape[0]
        if (self._dim is not None) and (len(data_shape) != (self._dim + 2)):
            raise ValueError(
                f"detected an unexpected data_shape as {data_shape}, "
                f"expecting data_shape has {self._dim + 2} dimension"
            )

        return OutputShapeCalculator.dropout(
            self._dim,
            None,
            *input_shape,
        )


class Dropout(_Dropout):
    _api_name = 'Dropout'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, **kwargs)


class Dropout1d(_Dropout):
    _api_name = 'Dropout1d'

    _dim = 1

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, **kwargs)


class Dropout2d(_Dropout):
    _api_name = 'Dropout2d'

    _dim = 2

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, **kwargs)


class Dropout3d(_Dropout):
    _api_name = 'Dropout3d'

    _dim = 3

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, **kwargs)
