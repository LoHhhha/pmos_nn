# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.activation.common import _SimpleActivation

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
]


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

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # check super()
        super().output_shape(*input_shape, **kwargs)

        data_shape = list(input_shape[0])

        try:
            data_shape[self.dim]
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape should have {self.dim} dimension"
            )

        if data_shape[self.dim] % 2:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape[{self.dim}] is even"
            )

        data_shape[self.dim] //= 2

        return tuple(data_shape),


class Softsign(_SimpleActivation):
    _api_name = "Softsign"


class Softmax2d(_SimpleActivation):
    _api_name = "Softmax2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # check super()
        super().output_shape(*input_shape, **kwargs)

        data_shape = input_shape[0]

        if len(data_shape) not in (3, 4):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                "expected data_shape should have 3 or 4 dimensions"
            )

        return data_shape,


class Identity(_SimpleActivation):
    _api_name = "Identity"
