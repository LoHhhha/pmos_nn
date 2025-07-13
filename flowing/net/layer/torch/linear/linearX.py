# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
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

    def __init__(self, out_features: int, bias: bool = True, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.out_features = out_features
        self.bias = bias

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]

        output_shape = list(data_shape)
        try:
            output_shape[-1] = self.out_features
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape has at least 1 dimension"
            )
        return tuple(output_shape),


class Linear(LayerLinear):
    _api_name = "Linear"

    in_features: Annotated[int, Layer.LayerContent]

    def __init__(self, in_features: int, **kwargs):
        super().__init__(**kwargs)
        self.in_features = in_features

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        output_shape = super().output_shape(*input_shape)

        data_shape = input_shape[0]
        if data_shape[-1] != self.in_features:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape -1 dimension is equal to out_features as {self.in_features}"
            )

        return output_shape


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

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data1_shape = list(input_shape[0])
        data2_shape = list(input_shape[1])

        if data1_shape[-1] != self.in1_features:
            raise ValueError(
                f"detect an unexpected data1_shape as {data1_shape}, "
                f"expected data1_shape -1 dimension is equal to out_features as {self.in1_features}"
            )

        if data2_shape[-1] != self.in2_features:
            raise ValueError(
                f"detect an unexpected data2_shape as {data2_shape}, "
                f"expected data2_shape -1 dimension is equal to out_features as {self.in2_features}"
            )

        if data1_shape[:-1] != data2_shape[:-1]:
            raise ValueError(
                f"detect an unexpected data1_shape as {data1_shape} and data2_shape as {data2_shape}, "
                f"expected data1_shape[:-1] to be equal to data2_shape[:-1]"
            )

        return tuple(data1_shape[:-1] + [self.out_features]),
