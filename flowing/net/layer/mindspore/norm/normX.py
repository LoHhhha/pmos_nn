# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    "BatchNorm1d",
    "BatchNorm2d",
    "BatchNorm3d",
    "InstanceNorm1d",
    "InstanceNorm2d",
    "InstanceNorm3d",
]


class _InstanceNorm(MindSporeNNLayer):
    data_amount = 1
    output_amount = 1

    num_features: Annotated[int, Layer.LayerContent]
    eps: Annotated[float, Layer.LayerContent]
    momentum: Annotated[float, Layer.LayerContent]
    affine: Annotated[bool, Layer.LayerContent]

    _dim: int

    def __init__(
            self,
            num_features: int,
            eps: float = 1e-5,
            momentum: float = 0.1,
            affine: bool = True,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.num_features = num_features
        self.eps = eps
        self.momentum = momentum
        self.affine = affine

    def content_check(self):
        if self.num_features < 1:
            raise ValueError(
                f"detected an unexpected num_features as {self.num_features}, "
                f"expecting num_features>=1"
            )

        if self.momentum < 0 or self.momentum > 1:
            raise ValueError(
                f"detected an unexpected momentum as {self.momentum}, "
                f"expecting 0<=momentum<=1"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.batch_norm(
            (self._dim + 2,),
            self.num_features,
            *input_shape,
        )


class InstanceNorm1d(_InstanceNorm):
    _api_name = "InstanceNorm1d"

    _dim = 1


class InstanceNorm2d(_InstanceNorm):
    _api_name = "InstanceNorm2d"

    _dim = 2


class InstanceNorm3d(_InstanceNorm):
    _api_name = "InstanceNorm3d"

    _dim = 3


class _BatchNorm(_InstanceNorm):
    use_batch_statistics: Annotated[Optional[bool], Layer.LayerContent]

    def __init__(
            self,
            use_batch_statistics: Optional[bool] = None,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.use_batch_statistics = use_batch_statistics


class BatchNorm1d(_BatchNorm):
    _api_name = "BatchNorm1d"

    _dim = 1


class BatchNorm2d(_BatchNorm):
    _api_name = "BatchNorm2d"

    _dim = 2


class BatchNorm3d(_BatchNorm):
    _api_name = "BatchNorm3d"

    _dim = 3
