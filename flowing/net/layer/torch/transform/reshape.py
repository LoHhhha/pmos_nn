# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    'Reshape'
]


class Reshape(TorchLayer):
    _api_name = "reshape"

    shape: Annotated[Tuple[int, ...], Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, output_shape, **kwargs):
        super().__init__(**kwargs)
        self.shape = output_shape

    def content_check(self):
        negs = [x for x in self.shape if x < 0]

        if len(negs) > 1:
            raise ValueError(
                f"detected an unexpected shape as {self.shape}, "
                f"expecting haven't more than one negative number"
            )

        if negs.count(-1) != len(negs):
            raise ValueError(
                f"detected an unexpected shape as {self.shape}, "
                f"expecting only contains -1"
            )

    @Layer.injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        args = self.get_forward_args(
            extend_params=self.get_contents(Layer.LayerForwardContent),
            data_names_identifiers=["input"],
        )
        right_value = f"torch.{self._api_name}({args})"

        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.reshape(
            self.shape,
            *input_shape,
        )
