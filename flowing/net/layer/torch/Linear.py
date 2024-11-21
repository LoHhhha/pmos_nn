# Copyright © 2024 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'LayerLinear',
    'Linear',
]


class LayerLinear(Layer):
    out_features: int
    bias: bool

    _api_name = "LayerLinear"

    data_amount = 1
    output_amount = 1

    def __init__(self, out_features: int, bias: bool = True, data_amount: int | None = None):
        self.out_features = out_features
        self.bias = bias

        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"out_features={self.out_features}, bias={self.bias})")

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        output_shape = list(input_shape)
        try:
            output_shape[-1] = self.out_features
        except IndexError:
            raise ValueError(
                f"Expected unexpected input_shape as {input_shape}, "
            )
        return tuple(output_shape)


class Linear(LayerLinear):
    in_features: int

    _api_name = "Linear"

    def __init__(self, in_features: int, **kwargs):
        super().__init__(**kwargs)
        self.in_features = in_features

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"in_features={self.in_features}, out_features={self.out_features}, bias={self.bias})")
