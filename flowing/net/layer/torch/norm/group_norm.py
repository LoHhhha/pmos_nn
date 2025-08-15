# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    "GroupNorm",
]


class GroupNorm(TorchNNLayer):
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
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.num_groups = num_groups
        self.num_channels = num_channels
        self.eps = eps
        self.affine = affine

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.group_norm(
            self.num_groups,
            self.num_channels,
            *input_shape,
        )
