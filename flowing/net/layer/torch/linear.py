# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer

__all__ = [
    'LayerLinear',
    'Linear',
]


class LayerLinear(Layer):
    _api_name = "LayerLinear"

    out_features: Annotated[int, Layer.LayerContent]
    bias: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, out_features: int, bias: bool = True, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.out_features = out_features
        self.bias = bias

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

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
