# Copyright © 2024-2025 PMoS. All rights reserved.

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
        super().__init__(data_amount=data_amount)

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}()",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(input_shape[0]),
