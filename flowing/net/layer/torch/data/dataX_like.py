# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer

__all__ = [
    "RandLike",
    "RandNormalLike",
    "RandIntLike",
    "OnesLike",
    "ZerosLike",
    "FullLike",
]


class _DataXLike(Layer):
    _api_name = ...

    requires_grad: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, requires_grad: bool = False, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.requires_grad = requires_grad

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return f"{self.output_name} = torch.{self._api_name}({self.data_names[0]}, requires_grad={self.requires_grad})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(input_shape[0]),


class RandLike(_DataXLike):
    _api_name = "rand_like"


class RandNormalLike(_DataXLike):
    _api_name = "randn_like"


class RandIntLike(_DataXLike):
    _api_name = "randint_like"

    low: Annotated[int, Layer.LayerContent]
    high: Annotated[int, Layer.LayerContent]

    def __init__(self, high: int, low: int = 0, **kwargs):
        super().__init__(**kwargs)

        self.low = low
        self.high = high

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        return (f"{self.output_name} = torch.{self._api_name}({self.data_names[0]}, low={self.low}, high={self.high}, "
                f"requires_grad={self.requires_grad})"),


class OnesLike(_DataXLike):
    _api_name = "ones_like"


class ZerosLike(_DataXLike):
    _api_name = "zeros_like"


class FullLike(_DataXLike):
    _api_name = "full_like"

    fill_value: Annotated[float, Layer.LayerContent]

    def __init__(self, fill_value: float = 0, **kwargs):
        super().__init__(**kwargs)

        self.fill_value = fill_value

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        return (f"{self.output_name} = torch.{self._api_name}({self.data_names[0]}, fill_value={self.fill_value}, "
                f"requires_grad={self.requires_grad})"),
