# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
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

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]

        if self.num_groups == 0 or self.num_channels % self.num_groups != 0:
            raise ValueError(
                f"detect an unexpected num_channels as {self.num_channels} and num_groups {self.num_groups}, "
                f"expected {self.num_channels} can be divisible by {self.num_groups}."
            )

        if len(data_shape) < 2:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                "expected data_shape must be at least 2 dimensional"
            )

        if self.num_channels != data_shape[1]:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape's 2nd dimension is {self.num_channels}"
            )

        return tuple(data_shape),
