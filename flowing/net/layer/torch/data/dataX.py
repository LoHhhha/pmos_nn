# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchLayer
from flowing.net.layer.torch.types import Device, Dtype

__all__ = [
    "Rand",
    "RandNormal",
    "RandInt",
    "Ones",
    "Zeros",
    "Full",
]


class _DataX(TorchLayer):
    _api_name = ...

    size: Annotated[Tuple[int, ...], Layer.LayerForwardContent]
    device: Annotated[Device, Layer.LayerForwardContent]
    dtype: Annotated[Dtype, Layer.LayerForwardContent]
    requires_grad: Annotated[bool, Layer.LayerForwardContent]

    data_amount = 0
    output_amount = 1

    def __init__(
            self,
            size: Tuple[int, ...],
            device: Optional[str] = None,
            dtype: Optional[str] = None,
            requires_grad: bool = False,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.size = size
        self.device = Device(device)
        self.dtype = Dtype(dtype)
        self.requires_grad = requires_grad

    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return super().forward_code(identifier=f"torch.{self._api_name}")

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(self.size),


class Rand(_DataX):
    _api_name = "rand"


class RandNormal(_DataX):
    _api_name = "randn"


class RandInt(_DataX):
    _api_name = "randint"

    low: Annotated[int, Layer.LayerForwardContent]
    high: Annotated[int, Layer.LayerForwardContent]

    def __init__(self, high: int, low: int = 0, **kwargs):
        super().__init__(**kwargs)

        self.low = low
        self.high = high

    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return super().forward_code(identifier=f"torch.{self._api_name}")


class Ones(_DataX):
    _api_name = "ones"


class Zeros(_DataX):
    _api_name = "zeros"


class Full(_DataX):
    _api_name = "full"

    fill_value: Annotated[float, Layer.LayerForwardContent]

    def __init__(self, fill_value: float = 0, **kwargs):
        super().__init__(**kwargs)

        self.fill_value = fill_value

    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return super().forward_code(identifier=f"torch.{self._api_name}")
