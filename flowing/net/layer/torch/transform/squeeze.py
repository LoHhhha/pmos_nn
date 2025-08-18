# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    "Squeeze",
    "Unsqueeze"
]


class Squeeze(TorchLayer):
    _api_name = "squeeze"

    dim: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    # using to ensure param dim will be deleted when dim=None
    # because squeeze using overload to implement
    @staticmethod
    def _squeeze_forward(dim=None):
        pass

    def __init__(
            self,
            dim: Optional[int | Tuple[int, ...]] = None,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.dim = dim

        self._api_forward_func = Squeeze._squeeze_forward

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
        return OutputShapeCalculator.squeeze(
            self.dim,
            *input_shape,
        )


class Unsqueeze(TorchLayer):
    _api_name = "unsqueeze"

    dim: Annotated[int, Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dim: int,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.dim = dim

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
        return OutputShapeCalculator.unsqueeze(
            self.dim,
            *input_shape,
        )
