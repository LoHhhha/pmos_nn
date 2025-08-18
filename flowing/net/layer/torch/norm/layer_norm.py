# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    "LayerNorm",
]


class LayerNorm(TorchNNLayer):
    _api_name = "LayerNorm"

    normalized_shape: Annotated[List[int], Layer.LayerContent]
    eps: Annotated[float, Layer.LayerContent]
    elementwise_affine: Annotated[bool, Layer.LayerContent]
    bias: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            normalized_shape: int | List[int] | Tuple[int, ...],
            eps: float = 1e-5,
            elementwise_affine: bool = True,
            bias: bool = True,
            **kwargs
    ):
        super().__init__(**kwargs)
        if isinstance(normalized_shape, int):
            self.normalized_shape = [normalized_shape]
        else:
            self.normalized_shape = list(normalized_shape)
        self.eps = eps
        self.elementwise_affine = elementwise_affine
        self.bias = bias

    def content_check(self):
        if len([val for val in self.normalized_shape if val <= 0]):
            raise ValueError(
                f"detect an unexpected normalized_shape as {self.normalized_shape}, "
                f"expected it contains positive value"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.layer_norm(
            self.normalized_shape,
            -len(self.normalized_shape),
            *input_shape,
        )
