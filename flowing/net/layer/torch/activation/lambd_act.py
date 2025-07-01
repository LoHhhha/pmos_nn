# Copyright © 2025 PMoS. All rights reserved.

from flowing.net.layer.torch.activation.common import _LambdActivation

__all__ = [
    'Softshrink',
    'Hardshrink',
]


class Softshrink(_LambdActivation):
    _api_name = "Softshrink"


class Hardshrink(_LambdActivation):
    _api_name = "Hardshrink"
