# Copyright © 2025 PMoS. All rights reserved.

from flowing.net.layer.mindspore.activation.common import _LambdActivation

__all__ = [
    'SoftShrink',
    'HShrink',
]


class SoftShrink(_LambdActivation):
    _api_name = "SoftShrink"


class HShrink(_LambdActivation):
    _api_name = "HShrink"
