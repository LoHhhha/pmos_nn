# Copyright © 2025 PMoS. All rights reserved.

from typing import Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.activation.common import _InplaceActivation

__all__ = [
    'ReLU',
    'SELU',
    'CELU',
    'ELU',
    'LeakyReLU',
    'Threshold',
    'ReLU6',
    'Hardsigmoid',
    'Hardtanh',
    'Hardswish',
    'SiLU',
    'Mish',
]


class ReLU(_InplaceActivation):
    _api_name = "ReLU"


class SELU(_InplaceActivation):
    _api_name = "SELU"


class CELU(_InplaceActivation):
    _api_name = "CELU"

    alpha: Annotated[float, Layer.LayerContent]

    def __init__(self, alpha: float = 1.0, **kwargs):
        super().__init__(**kwargs)

        self.alpha = alpha


class ELU(CELU):
    _api_name = "ELU"


class LeakyReLU(_InplaceActivation):
    _api_name = "LeakyReLU"

    negative_slope: Annotated[float, Layer.LayerContent]

    def __init__(self, negative_slope: float = 0.01, **kwargs):
        super().__init__(**kwargs)

        self.negative_slope = negative_slope


class Threshold(_InplaceActivation):
    _api_name = "Threshold"

    threshold: Annotated[float, Layer.LayerContent]
    value: Annotated[float, Layer.LayerContent]

    def __init__(self, threshold: float, value: float, **kwargs):
        super().__init__(**kwargs)

        self.threshold = threshold
        self.value = value


class ReLU6(_InplaceActivation):
    _api_name = "ReLU6"


class Hardsigmoid(_InplaceActivation):
    _api_name = "Hardsigmoid"


class Hardtanh(_InplaceActivation):
    _api_name = "Hardtanh"

    min_val: Annotated[float, Layer.LayerContent]
    max_val: Annotated[float, Layer.LayerContent]

    def __init__(self, min_val: float = -1, max_val: float = 1, **kwargs):
        super().__init__(**kwargs)

        self.min_val = min_val
        self.max_val = max_val


class Hardswish(_InplaceActivation):
    _api_name = "Hardswish"


class SiLU(_InplaceActivation):
    _api_name = "SiLU"


class Mish(_InplaceActivation):
    _api_name = "Mish"
