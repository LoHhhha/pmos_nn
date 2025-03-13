# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer

__all__ = [
    'PReLU',
    'GELU',
    'Sigmoid',
    'LogSigmoid',
    'Softplus',
    'Tanh',
    'Tanhshrink',
    'GLU',
    'Softsign',
    'Softmax2d',
    'Identity',
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
    'Softmax',
    'LogSoftmax',
    'Softmin',
    'Softshrink',
    'Hardshrink',
]


class _SimpleActivation(Layer):
    data_amount = 1
    output_amount = 1

    def __init__(self, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape = input_shape[0]
        return tuple(input_shape),

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)


class _InplaceActivation(_SimpleActivation):
    inplace: Annotated[bool, Layer.LayerContent]

    def __init__(self, inplace: bool = False, **kwargs):
        super().__init__(**kwargs)
        self.inplace = inplace


class _OptionalDimActivation(_SimpleActivation):
    dim: Annotated[Optional[int], Layer.LayerContent]

    def __init__(self, dim: Optional[int] = None, **kwargs):
        super().__init__(**kwargs)

        self.dim = dim


class _LambdActivation(_SimpleActivation):
    lambd: Annotated[float, Layer.LayerContent]

    def __init__(self, lambd: float = 0.5, **kwargs):
        super().__init__(**kwargs)

        self.lambd = lambd


class PReLU(_SimpleActivation):
    _api_name = "PReLU"

    num_parameters: Annotated[int, Layer.LayerContent]
    init: Annotated[float, Layer.LayerContent]

    def __init__(self, num_parameters: int = 1, init: float = 0.25, **kwargs):
        super().__init__(**kwargs)

        self.num_parameters = num_parameters
        self.init = init


class GELU(_SimpleActivation):
    _api_name = "GELU"

    approximate: Annotated[str, Layer.LayerContent]

    def __init__(self, approximate: str = 'none', **kwargs):
        super().__init__(**kwargs)

        self.approximate = approximate


class Sigmoid(_SimpleActivation):
    _api_name = "Sigmoid"


class LogSigmoid(_SimpleActivation):
    _api_name = "LogSigmoid"


class Softplus(_SimpleActivation):
    _api_name = "Softplus"

    beta: Annotated[float, Layer.LayerContent]
    threshold: Annotated[float, Layer.LayerContent]

    def __init__(self, beta: float = 1.0, threshold: float = 20.0, **kwargs):
        super().__init__(**kwargs)

        self.beta = beta
        self.threshold = threshold


class Tanh(_SimpleActivation):
    _api_name = "Tanh"


class Tanhshrink(_SimpleActivation):
    _api_name = "Tanhshrink"


class GLU(_SimpleActivation):
    _api_name = "GLU"

    dim: Annotated[int, Layer.LayerContent]

    def __init__(self, dim: int = -1, **kwargs):
        super().__init__(**kwargs)

        self.dim = dim


class Softsign(_SimpleActivation):
    _api_name = "Softsign"


class Softmax2d(_SimpleActivation):
    _api_name = "Softmax2d"

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]

        if len(data_shape) not in (3, 4):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                "expect data_shape should have 3 or 4 dimensions"
            )

        return data_shape,


class Identity(_SimpleActivation):
    _api_name = "Identity"


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


class Softmax(_OptionalDimActivation):
    _api_name = "Softmax"


class LogSoftmax(_OptionalDimActivation):
    _api_name = "LogSoftmax"


class Softmin(_OptionalDimActivation):
    _api_name = "Softmin"


class Softshrink(_LambdActivation):
    _api_name = "Softshrink"


class Hardshrink(_LambdActivation):
    _api_name = "Hardshrink"
