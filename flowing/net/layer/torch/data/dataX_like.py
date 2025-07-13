# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    "RandLike",
    "RandNormalLike",
    "RandIntLike",
    "OnesLike",
    "ZerosLike",
    "FullLike",
]


class _DataXLike(TorchLayer):
    _api_name = ...

    requires_grad: Annotated[bool, Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, requires_grad: bool = False, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.requires_grad = requires_grad

    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return super().forward_code(identifier=f"torch.{self._api_name}")

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(input_shape[0]),


class RandLike(_DataXLike):
    _api_name = "rand_like"


class RandNormalLike(_DataXLike):
    _api_name = "randn_like"


class RandIntLike(_DataXLike):
    _api_name = "randint_like"

    low: Annotated[int, Layer.LayerForwardContent]
    high: Annotated[int, Layer.LayerForwardContent]

    def __init__(self, high: int, low: int = 0, **kwargs):
        super().__init__(**kwargs)

        self.low = low
        self.high = high

    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return super().forward_code(identifier=f"torch.{self._api_name}")


class OnesLike(_DataXLike):
    _api_name = "ones_like"


class ZerosLike(_DataXLike):
    _api_name = "zeros_like"


class FullLike(_DataXLike):
    _api_name = "full_like"

    fill_value: Annotated[float, Layer.LayerForwardContent]

    def __init__(self, fill_value: float = 0, **kwargs):
        super().__init__(**kwargs)

        self.fill_value = fill_value

    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return super().forward_code(identifier=f"torch.{self._api_name}")
