# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, Annotated, Dict, Any, List

from flowing.net.layer import Layer
from flowing.net.layer.mindspore.common import MindSporeLayer
from flowing.net.layer.obj import IdentifierStr


class Parameter(MindSporeLayer):
    _api_name = "Parameter"

    data_size: Tuple[int, ...]  # isn't LayerContent
    requires_grad: Annotated[bool, Layer.LayerContent]
    layerwise_parallel: Annotated[bool, Layer.LayerContent]
    parallel_optimizer: Annotated[bool, Layer.LayerContent]

    data_amount = 0
    output_amount = 1

    _enable_forward = False

    @property
    def output_name(self):
        if self.layer_name is ...:
            return ...
        return f"self.{self.layer_name}"

    @output_name.setter
    def output_name(self, value: str):
        pass

    def __init__(
            self,
            data_size: Tuple[int, ...],
            requires_grad: bool = True,
            layerwise_parallel: bool = False,
            parallel_optimizer: bool = True,
            **kwargs
    ):
        super().__init__(**kwargs)

        self.data_size = data_size
        self.requires_grad = requires_grad
        self.layerwise_parallel = layerwise_parallel
        self.parallel_optimizer = parallel_optimizer

    def content_check(self):
        if len([val for val in self.data_size if val <= 0]):
            raise ValueError(
                f"detected an unexpected data_size as {self.data_size}, "
                f"expecting it contains positive value"
            )

    def init_code(
            self,
            package: str = "mindspore",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        # todo: now only supports using mindspore.ops.randn to initial
        if extend_params is None:
            extend_params = {}
        extend_params["default_input"] = IdentifierStr(f"mindspore.ops.randn({repr(self.data_size)})")
        return super().init_code(
            package=package,
            add_self=add_self,
            extend_params=extend_params,
            only_right_value=only_right_value,
        )

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return tuple(self.data_size),
