# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    "Transpose",
]


class Transpose(TorchLayer):
    _api_name = "transpose"

    dim0: Annotated[int, Layer.LayerForwardContent]
    dim1: Annotated[int, Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dim0: int,
            dim1: int,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.dim0 = dim0
        self.dim1 = dim1

    @Layer.injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        args = {self.get_forward_args(
            extend_params=self.get_contents(Layer.LayerForwardContent),
            data_names_identifiers=["input"],
        )}
        right_value = f"torch.{self._api_name}({args})"

        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]
        result_shape = list(data_shape)
        try:
            dim_shape = result_shape[self.dim0]
            result_shape[self.dim0] = result_shape[self.dim1]
            result_shape[self.dim1] = dim_shape
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's item has index {self.dim0} and {self.dim1} at least"
            )
        return tuple(result_shape),
