# Copyright © 2025 PMoS. All rights reserved.

from flowing.net.layer.torch.activation.common import _OptionalDimActivation

__all__ = [
    'Softmax',
    'LogSoftmax',
    'Softmin',
]


class Softmax(_OptionalDimActivation):
    _api_name = "Softmax"


class LogSoftmax(_OptionalDimActivation):
    _api_name = "LogSoftmax"


class Softmin(_OptionalDimActivation):
    _api_name = "Softmin"
