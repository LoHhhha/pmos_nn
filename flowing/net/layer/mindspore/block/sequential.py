# Copyright © 2025 PMoS. All rights reserved.

import functools
from typing import Optional, Annotated, Dict, Tuple, List, Any

from flowing.net.layer import Layer
from flowing.net.layer import utils as layer_utils
from flowing.net.layer.mindspore.common import MindSporeNNLayer

__all__ = [
    'SequentialCell'
]


class SequentialCell(MindSporeNNLayer):
    _api_name = 'SequentialCell'

    data_amount = 1
    output_amount = 1

    modules: Annotated[Tuple[Dict[str, str | Dict]], Layer.LayerContent]

    layers: List[MindSporeNNLayer]

    def __init__(
            self,
            modules: Tuple[Dict[str, str | Dict]],
            data_amount: Optional[int] = None,  # delete this from kwargs
            **kwargs
    ):
        """
        Args:
            modules: Tuple[{
                apiName: str,
                content: Dict[str, Any],
            }]
        """
        super().__init__(data_amount=data_amount, **kwargs)

        self.modules = modules
        self.layers = layer_utils.get_layers_from_modules(
            self.modules,
            "flowing.net.layer.mindspore",
            accept_layer_cls=[MindSporeNNLayer],
            extend_init_kwargs=kwargs
        )

    def content_check(self):
        if len(self.layers) == 0:
            raise ValueError(
                f"detected an empty SequentialCell, "
                f"which can't calculate the output shape"
            )

    def init_code(
            self,
            package: str = "mindspore.nn",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        sub_layer_rvalues = functools.reduce(
            lambda x, y: x + y,
            tuple(layer.init_code(only_right_value=True) for layer in self.layers),
        )
        package_name = f"{package}." if package and not package.endswith(".") else package
        right_value = (f"{package_name}{self._api_name}"
                       f"([{', '.join(sub_layer_rvalues)}])")
        if only_right_value:
            return right_value,

        self.named_check()
        return f"{'self.' if add_self else ''}{self.layer_name} = {right_value}",

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = tuple(input_shape[0])

        for idx, layer in enumerate(self.layers):
            try:
                data_shape = layer.output_shape(data_shape)[0]
            except Exception as e:
                raise ValueError(
                    f"detected error in {layer._api_name}(No.{idx + 1}): {e}"
                )

        return data_shape,
