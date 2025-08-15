# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    'Flatten',
    'Unflatten',
]


class Flatten(TorchNNLayer):
    _api_name = "Flatten"

    start_dim: Annotated[int, Layer.LayerContent]
    end_dim: Annotated[int, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, start_dim: int = 1, end_dim: int = -1, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.start_dim = start_dim
        self.end_dim = end_dim

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.flatten(
            self.start_dim,
            self.end_dim,
            *input_shape,
        )


class Unflatten(TorchNNLayer):
    _api_name = "Unflatten"

    dim: Annotated[int, Layer.LayerContent]
    unflattened_size: Annotated[Tuple[int, ...], Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, dim: int, unflattened_size: Tuple[int, ...], data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.dim = dim
        self.unflattened_size = unflattened_size

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.unflatten(
            self.dim,
            self.unflattened_size,
            *input_shape,
        )
