# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.types import Dtype
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeOpsLayer

__all__ = [
    "RandLike",
    "RandNormalLike",
    "RandIntLike",
    "OnesLike",
    "ZerosLike",
    "FullLike",
]


class _DataXLike(MindSporeOpsLayer):
    dtype: Annotated[Dtype, Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dtype: Optional[str] = None,
            **kwargs
    ):
        super().__init__(**kwargs)
        self.dtype = Dtype(dtype)

    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        return super().forward_code(identifier=f"mindspore.ops.{self._api_name}")

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.same_as_input_shape(*input_shape)


class RandLike(_DataXLike):
    _api_name = "rand_like"

    seed: Annotated[Optional[int], Layer.LayerForwardAfterDataArg, Layer.LayerForwardArgPriority(16)]

    def __init__(self, seed: Optional[int] = None, **kwargs):
        super().__init__(**kwargs)

        self.seed = seed

    def content_check(self):
        if self.seed is not None and self.seed < 0:
            raise ValueError(
                f"detected an unexpected seed as {self.seed}, "
                f"expecting seed>=0 or seed==None"
            )


class RandNormalLike(RandLike):
    _api_name = "randn_like"


class RandIntLike(RandLike):
    _api_name = "randint_like"

    low: Annotated[int, Layer.LayerForwardAfterDataArg, Layer.LayerForwardArgPriority(4)]
    high: Annotated[int, Layer.LayerForwardAfterDataArg, Layer.LayerForwardArgPriority(8)]

    def __init__(self, high: int, low: int = 0, **kwargs):
        super().__init__(**kwargs)

        self.low = low
        self.high = high


class OnesLike(_DataXLike):
    _api_name = "ones_like"


class ZerosLike(_DataXLike):
    _api_name = "zeros_like"


class FullLike(_DataXLike):
    _api_name = "full_like"

    fill_value: Annotated[float, Layer.LayerForwardAfterDataArg, Layer.LayerForwardArgPriority(16)]

    def __init__(self, fill_value: float = 0, **kwargs):
        super().__init__(**kwargs)

        self.fill_value = fill_value
