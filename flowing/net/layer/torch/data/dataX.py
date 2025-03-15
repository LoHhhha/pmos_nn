# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.types import Device, Dtype

__all__ = [
    "Rand",
    "RandNormal",
    "RandInt",
    "Ones",
    "Zeros",
    "Full",
]


class _DataX(Layer):
    _api_name = ...

    size: Annotated[Tuple[int, ...], Layer.LayerContent]
    device: Annotated[Device, Layer.LayerContent]
    dtype: Annotated[Dtype, Layer.LayerContent]
    requires_grad: Annotated[bool, Layer.LayerContent]

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

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return (f"{self.output_name} = torch.{self._api_name}(size={self.size}, device={self.device}, "
                f"dtype={self.dtype}, requires_grad={self.requires_grad})"),

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(self.size),


class Rand(_DataX):
    _api_name = "rand"


class RandNormal(_DataX):
    _api_name = "randn"


class RandInt(_DataX):
    _api_name = "randint"

    low: Annotated[int, Layer.LayerContent]
    high: Annotated[int, Layer.LayerContent]

    def __init__(self, high: int, low: int = 0, **kwargs):
        super().__init__(**kwargs)

        self.low = low
        self.high = high

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        return (f"{self.output_name} = torch.{self._api_name}(size={self.size}, low={self.low}, high={self.high}, "
                f"device={self.device}, dtype={self.dtype}, requires_grad={self.requires_grad})"),


class Ones(_DataX):
    _api_name = "ones"


class Zeros(_DataX):
    _api_name = "zeros"


class Full(_DataX):
    _api_name = "full"

    fill_value: Annotated[float, Layer.LayerContent]

    def __init__(self, fill_value: float = 0, **kwargs):
        super().__init__(**kwargs)

        self.fill_value = fill_value

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        return (f"{self.output_name} = torch.{self._api_name}(size={self.size}, fill_value={self.fill_value}, "
                f"device={self.device}, dtype={self.dtype}, requires_grad={self.requires_grad})"),
