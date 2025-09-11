# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional, Dict, Any

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.mindspore.common import MindSporeOpsLayer

__all__ = [
    "Permute",
]


class Permute(MindSporeOpsLayer):
    _api_name = "permute"

    axis: Annotated[Tuple[int, ...], Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            axis: Tuple[int, ...],
            **kwargs
    ):
        super().__init__(**kwargs)
        self.axis = axis

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
        right_value = f"mindspore.ops.{self._api_name}({args})"

        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    def content_check(self):
        length = len(self.axis)
        really_dims = tuple(dim if dim >= 0 else length + dim for dim in self.axis)

        dims_set = set(really_dims)
        if len(dims_set) != length:
            raise ValueError(
                f"detected an unexpected axis as {self.axis}, "
                f"expecting it's items are different"
            )

        min_dim, max_dim = min(dims_set), max(dims_set)
        if min_dim != 0 or max_dim != length - 1:
            raise ValueError(
                f"detected an unexpected axis as {self.axis}, "
                f"expecting it is a permutation of 0 to length-1 or -length to -1"
            )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.permute(
            self.axis,
            *input_shape,
        )
