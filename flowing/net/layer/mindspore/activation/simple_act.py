# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import DataShapeChecker
from flowing.net.layer.mindspore.activation.common import _SimpleActivation

__all__ = [
    'PReLU',
    'FastGelu',
    'GELU',
    'Sigmoid',
    'LogSigmoid',
    'Tanh',
    'Tanhshrink',
    'Softsign',
    'Softmax2d',
    'Identity',
    'ReLU',
    'SELU',
    'Threshold',
    'ReLU6',
    'HSigmoid',
    'Hardtanh',
    'HSwish',
    'SiLU',
    'Mish',
]


class PReLU(_SimpleActivation):
    _api_name = "PReLU"

    num_parameters: Annotated[int, Layer.LayerContent]
    init: Annotated[float, Layer.LayerContent]

    def __init__(self, num_parameters: int = 1, init: float = 0.25, **kwargs):
        super().__init__(**kwargs)

        self.num_parameters = num_parameters
        self.init = init


class FastGelu(_SimpleActivation):
    _api_name = "FastGelu"


class GELU(_SimpleActivation):
    _api_name = "GELU"

    approximate: Annotated[bool, Layer.LayerContent]

    def __init__(self, approximate: bool = True, **kwargs):
        super().__init__(**kwargs)

        self.approximate = approximate


class Sigmoid(_SimpleActivation):
    _api_name = "Sigmoid"


class LogSigmoid(_SimpleActivation):
    _api_name = "LogSigmoid"


class Tanh(_SimpleActivation):
    _api_name = "Tanh"


class Tanhshrink(_SimpleActivation):
    _api_name = "Tanhshrink"


class Softsign(_SimpleActivation):
    _api_name = "Softsign"


class Softmax2d(_SimpleActivation):
    _api_name = "Softmax2d"

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]

        DataShapeChecker.shape_dim(data_shape, 2)

        return tuple(data_shape),


class Identity(_SimpleActivation):
    _api_name = "Identity"


class ReLU(_SimpleActivation):
    _api_name = "ReLU"


class SELU(_SimpleActivation):
    _api_name = "SELU"


class Threshold(_SimpleActivation):
    _api_name = "Threshold"

    threshold: Annotated[float, Layer.LayerContent]
    value: Annotated[float, Layer.LayerContent]

    def __init__(self, threshold: float, value: float, **kwargs):
        super().__init__(**kwargs)

        self.threshold = threshold
        self.value = value


class ReLU6(_SimpleActivation):
    _api_name = "ReLU6"


class HSigmoid(_SimpleActivation):
    _api_name = "HSigmoid"


class Hardtanh(_SimpleActivation):
    _api_name = "Hardtanh"

    min_val: Annotated[float, Layer.LayerContent]
    max_val: Annotated[float, Layer.LayerContent]

    def __init__(self, min_val: float = -1, max_val: float = 1, **kwargs):
        super().__init__(**kwargs)

        self.min_val = min_val
        self.max_val = max_val


class HSwish(_SimpleActivation):
    _api_name = "HSwish"


class SiLU(_SimpleActivation):
    _api_name = "SiLU"


class Mish(_SimpleActivation):
    _api_name = "Mish"
