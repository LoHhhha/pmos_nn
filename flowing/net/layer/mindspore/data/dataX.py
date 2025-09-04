# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.common import MindSporeOpsLayer
from flowing.net.layer.mindspore.types import Dtype

__all__ = [
    "Rand",
    "RandNormal",
    "RandInt",
    "Ones",
    "Zeros",
    "Full",
]


class _DataX(MindSporeOpsLayer):
    size: Annotated[Tuple[int, ...], Layer.LayerForwardBeforeDataArg, Layer.LayerForwardArgPriority(16)]
    dtype: Annotated[Dtype, Layer.LayerForwardContent]

    data_amount = 0
    output_amount = 1

    def __init__(
            self,
            size: Tuple[int, ...],
            dtype: Optional[str] = None,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.size = size
        self.dtype = Dtype(dtype)

    def content_check(self):
        if len([val for val in self.size if val <= 0]):
            raise ValueError(
                f"detected an unexpected size as {self.size}, "
                f"expecting it contains positive value"
            )

    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        return super().forward_code(identifier=f"mindspore.ops.{self._api_name}")

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(self.size),


class Rand(_DataX):
    _api_name = "rand"

    seed: Annotated[Optional[int], Layer.LayerForwardContent]

    def __init__(self, seed: Optional[int] = None, **kwargs):
        super().__init__(**kwargs)

        self.seed = seed

    def content_check(self):
        if self.seed is not None and self.seed < 0:
            raise ValueError(
                f"detected an unexpected seed as {self.seed}, "
                f"expecting seed>=0 or seed==None"
            )


class RandNormal(Rand):
    _api_name = "randn"


class RandInt(Rand):
    _api_name = "randint"

    low: Annotated[int, Layer.LayerForwardBeforeDataArg, Layer.LayerForwardArgPriority(4)]
    high: Annotated[int, Layer.LayerForwardBeforeDataArg, Layer.LayerForwardArgPriority(8)]

    def __init__(self, high: int, low, **kwargs):
        super().__init__(**kwargs)

        self.low = low
        self.high = high


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
