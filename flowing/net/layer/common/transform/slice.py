# Copyright © 2025 PMoS. All rights reserved.

from typing import Annotated, Dict, Any, Tuple, Optional, List

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator

__all__ = [
    'Slice'
]


class Slice(Layer):
    _api_name = "Slice"

    dim: Annotated[int, Layer.LayerForwardContent]
    start: Annotated[int, Layer.LayerForwardContent]
    end: Annotated[int, Layer.LayerForwardContent]
    stride: Annotated[int, Layer.LayerForwardContent]

    _enable_init = False

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dim: int,
            start: int,
            end: int,
            stride: int = 1,
            **kwargs,
    ):
        super().__init__(**kwargs)

        self.dim = dim
        self.start = start
        self.end = end
        self.stride = stride

    def content_check(self):
        if self.dim < 0:
            raise ValueError(
                f"detected an unexpected dim as {self.dim}, "
                f"expecting dim>=0"
            )

        # stride must be greater than zero
        if self.stride <= 0:
            raise ValueError(
                f"detected an unexpected stride as {self.stride}, "
                f"expecting stride>0"
            )

        # start and end must >=0
        if self.start < 0 or self.end < 0:
            raise ValueError(
                f"detected an unexpected start as {self.start} or end as {self.end}, "
                f"expecting both start and end are not less than 0"
            )

        if self.end <= self.start:
            raise ValueError(
                f"detected an unexpected start as {self.start} or end as {self.end}, "
                f"expecting start is in front of end"
            )

    @Layer.injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        # identifier is useless
        right_value = f"{self.data_names[0]}[{':,' * self.dim}{self.start}:{self.end}:{self.stride}]"
        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.slice(
            self.dim,
            self.start,
            self.end,
            self.stride,
            *input_shape
        )
