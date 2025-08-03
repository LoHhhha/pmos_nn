# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    'Add',
    'Subtract',
    'Multiply',
    'Divide',
]


class _Operation(TorchLayer):
    operation: str = ...

    output_amount = 1

    layer_name = "Useless"

    def __init__(self, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)

    @Layer.injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        # identifier is useless
        right_value = f"{self.get_forward_args(block=f' {self.operation} ')}"
        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    @Layer.input_shape_check_wrap
    @Layer.data_amount_not_zero_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        input_shape: List[Tuple[int, ...] | List[int]] = sorted(input_shape, key=lambda item: len(item), reverse=True)

        prev: List[int] = list(input_shape[0])
        for shape in input_shape:
            shape: List[int]
            for idx in range(len(shape)):
                if shape[-idx - 1] != prev[-idx - 1]:
                    if shape[-idx - 1] == 1 or prev[-idx - 1] == 1:
                        prev[-idx - 1] = max(shape[-idx - 1], prev[-idx - 1])
                    else:
                        prev[-idx - 1] = -1
                # detect <=0 or not in (1, X)/(X, 1)/(X,X)
                if prev[-idx - 1] <= 0:
                    raise ValueError(
                        f"detect an unexpected input_shape as {input_shape}, "
                        f"has different postfix shapes"
                    )
        return tuple(prev),


class Add(_Operation):
    _api_name = "Add"

    operation = "+"


class Subtract(_Operation):
    _api_name = "Subtract"

    operation = "-"


class Multiply(_Operation):
    _api_name = "Multiply"

    operation = "*"


class Divide(_Operation):
    _api_name = "Divide"

    operation = "/"
