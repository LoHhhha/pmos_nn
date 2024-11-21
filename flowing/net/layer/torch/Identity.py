# Copyright © 2024 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Identity'
]


class Identity(Layer):
    _api_name = "Identity"

    data_amount = 1
    output_amount = 1

    def __init__(self, data_amount: int | None = None):
        self._set_data(data_amount=data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}()"

    def output_shape(self, input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[int, ...]:
        return tuple(input_shape)
