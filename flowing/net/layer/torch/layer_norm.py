# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer

__all__ = [
    "LayerNorm",
]


class LayerNorm(Layer):
    _api_name = "LayerNorm"

    normalized_shape: Annotated[List[int], Layer.LayerContent]
    eps: Annotated[float, Layer.LayerContent]
    elementwise_affine: Annotated[bool, Layer.LayerContent]
    bias: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            normalized_shape: List[int] | Tuple[int, ...],
            eps: float = 1e-5,
            elementwise_affine: bool = True,
            bias: bool = True,
            data_amount: int | None = None
    ):
        super().__init__(data_amount=data_amount)
        self.normalized_shape = list(normalized_shape)
        self.eps = eps
        self.elementwise_affine = elementwise_affine
        self.bias = bias

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = list(input_shape[0])

        if len(data_shape) != 1 + len(self.normalized_shape):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape must have {1 + len(self.normalized_shape)} dimensions"
            )

        # all are List
        allowed_shape = list(data_shape[:1] + self.normalized_shape)
        if allowed_shape != data_shape:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape must be {allowed_shape}"
            )

        return tuple(data_shape),
