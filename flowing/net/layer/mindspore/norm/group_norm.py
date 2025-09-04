# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    "GroupNorm",
]


class GroupNorm(MindSporeNNLayer):
    _api_name = "GroupNorm"

    num_groups: Annotated[int, Layer.LayerContent]
    num_channels: Annotated[int, Layer.LayerContent]
    eps: Annotated[float, Layer.LayerContent]
    affine: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            num_groups: int,
            num_channels: int,
            eps: float = 1e-5,
            affine: bool = True,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.num_groups = num_groups
        self.num_channels = num_channels
        self.eps = eps
        self.affine = affine

    def content_check(self):
        if self.num_groups <= 0:
            raise ValueError(
                f"detected an unexpected num_channels as {self.num_channels}, "
                f"expecting num_groups is positive"
            )

        if self.num_channels % self.num_groups != 0:
            raise ValueError(
                f"detected an unexpected num_channels as {self.num_channels} and num_groups as {self.num_groups}, "
                f"expecting num_channels can be divisible by num_groups"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.group_norm(
            self.num_channels,
            *input_shape,
        )
