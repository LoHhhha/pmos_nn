# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'ReLU',
    'LeakyReLU',
    'SELU',
    'CELU',
    'Sigmoid',
    'Softmax'
]


class _ReLU(Layer):
    inplace: bool

    data_amount = 1
    output_amount = 1

    def __init__(self, inplace: bool = False, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)
        self.inplace = inplace

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}(inplace={self.inplace})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = input_shape[0]
        return tuple(input_shape),


class ReLU(_ReLU):
    _api_name = "ReLU"


class SELU(_ReLU):
    _api_name = "SELU"


class CELU(_ReLU):
    alpha: float

    _api_name = "CELU"

    def __init__(self, alpha: float = 1.0, **kwargs):
        super().__init__(**kwargs)

        self.alpha = alpha


class LeakyReLU(_ReLU):
    negative_slope: float

    _api_name = "LeakyReLU"

    def __init__(self, negative_slope: float = 0.01, **kwargs):
        super().__init__(**kwargs)

        self.negative_slope = negative_slope


class Sigmoid(Layer):
    _api_name = "Sigmoid"

    data_amount = 1
    output_amount = 1

    def __init__(self, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}()",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = input_shape[0]
        return tuple(input_shape),


class Softmax(Layer):
    dim: int

    _api_name = "Softmax"

    data_amount = 1
    output_amount = 1

    def __init__(self, dim: int = None, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)
        self.dim = dim

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}(dim={self.dim})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = input_shape[0]
        return tuple(input_shape),
