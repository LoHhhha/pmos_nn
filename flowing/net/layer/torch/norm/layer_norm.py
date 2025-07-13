# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
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
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        if isinstance(normalized_shape, int):
            self.normalized_shape = [normalized_shape]
        else:
            self.normalized_shape = list(normalized_shape)
        self.eps = eps
        self.elementwise_affine = elementwise_affine
        self.bias = bias

    def _is_bad_data_shape(self, data_shape: List[int]) -> bool:
        if len(data_shape) < len(self.normalized_shape):
            return True

        for idx in range(len(self.normalized_shape)):
            if self.normalized_shape[-idx - 1] != data_shape[-idx - 1]:
                return True

        return False

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = list(input_shape[0])

        if self._is_bad_data_shape(data_shape):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape with shape [*] + {self.normalized_shape}"
            )

        return tuple(data_shape),
