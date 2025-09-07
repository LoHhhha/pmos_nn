# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.common import MindSporeNNLayer
from flowing.net.layer.mindspore.utils import mindspore_data_check
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.utils import get_and_check_target_dim_param, type_check

__all__ = [
    "AdaptiveAvgPool1d",
    "AdaptiveAvgPool2d",
    "AdaptiveAvgPool3d",
    "AdaptiveMaxPool1d",
    "AdaptiveMaxPool2d",
    "AdaptiveMaxPool3d",
]


class _AdaptivePool(MindSporeNNLayer):
    _dim: int

    data_amount = 1
    output_amount = 1

    output_size: Annotated[Tuple[int, ...] | List[int], Layer.LayerContent]

    def __init__(
            self,
            output_size: Tuple[int, ...] | List[int],
            **kwargs,
    ):
        super().__init__(**kwargs)

        self.output_size = output_size

    def content_check(self):
        _ = get_and_check_target_dim_param(self.output_size, self._dim, 1, "output_size")

        if self._dim == 1:
            type_check(self.output_size, int, "output_size", self._api_name)

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        mindspore_data_check(input_shape[0], self._dim)

        return OutputShapeCalculator.adaptive_pool(
            self._dim,
            self.output_size,
            False,
            *input_shape,
        )


class AdaptiveAvgPool1d(_AdaptivePool):
    _api_name = "AdaptiveAvgPool1d"

    _dim = 1


class AdaptiveAvgPool2d(_AdaptivePool):
    _api_name = "AdaptiveAvgPool2d"

    _dim = 2


class AdaptiveAvgPool3d(_AdaptivePool):
    _api_name = "AdaptiveAvgPool3d"

    _dim = 3


class AdaptiveMaxPool1d(_AdaptivePool):
    _api_name = "AdaptiveMaxPool1d"

    _dim = 1


class _EAdaptiveMaxPool(_AdaptivePool):
    return_indices: Annotated[bool, Layer.LayerContent]

    def __init__(
            self,
            return_indices: bool = False,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.return_indices = return_indices


class AdaptiveMaxPool2d(_EAdaptiveMaxPool):
    _api_name = "AdaptiveMaxPool2d"

    _dim = 2


class AdaptiveMaxPool3d(_EAdaptiveMaxPool):
    _api_name = "AdaptiveMaxPool3d"

    _dim = 3
