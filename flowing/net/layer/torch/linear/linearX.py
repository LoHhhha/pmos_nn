# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    'LayerLinear',
    'Linear',
    'Bilinear',
]


class LayerLinear(TorchNNLayer):
    _api_name = "LayerLinear"

    out_features: Annotated[int, Layer.LayerContent]
    bias: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, out_features: int, bias: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.out_features = out_features
        self.bias = bias

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need in_features as args.
        in_features = kwargs.get("in_features", None)

        return OutputShapeCalculator.linear(
            in_features,
            self.out_features,
            *input_shape
        )


class Linear(LayerLinear):
    _api_name = "Linear"

    in_features: Annotated[int, Layer.LayerContent]

    def __init__(self, in_features: int, **kwargs):
        super().__init__(**kwargs)
        self.in_features = in_features

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, in_features=self.in_features)


class Bilinear(LayerLinear):
    _api_name = "Bilinear"

    data_amount = 2
    output_amount = 1

    in1_features: Annotated[int, Layer.LayerContent]
    in2_features: Annotated[int, Layer.LayerContent]

    def __init__(self, in1_features: int, in2_features: int, **kwargs):
        super().__init__(**kwargs)

        self.in1_features = in1_features
        self.in2_features = in2_features

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.bilinear(
            self.in1_features,
            self.in2_features,
            self.out_features,
            *input_shape
        )
