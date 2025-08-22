# Copyright © 2025 PMoS. All rights reserved.

import functools
from typing import Optional, Annotated, Dict, Tuple, List, Any

from flowing.net.layer import Layer
from flowing.net.layer.layer_init_helper import LayerInitHelper
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    'Sequential'
]


class Sequential(TorchNNLayer):
    _api_name = 'Sequential'

    data_amount = 1
    output_amount = 1

    modules: Annotated[Tuple[Dict[str, str | Dict]], Layer.LayerContent]

    layers: List[TorchNNLayer]

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
        self.layers = self._get_layers_from_modules(**kwargs)

    def _get_layers_from_modules(self, **kwargs):
        layers = []
        for module in self.modules:
            layer_name = module.get('apiName', None)
            if layer_name is None:
                raise ValueError(
                    f"detected an unexpected modules, "
                    f"some of module don't have apiName"
                )

            try:
                layer_cls = LayerInitHelper.get_layer_cls(
                    package_name="flowing.net.layer.torch",
                    layer_name=module['apiName']
                )
                if not issubclass(layer_cls, TorchNNLayer):
                    raise ValueError(
                        f"detected an unexpected layer {layer_name}, "
                        f"which can't be push into Sequential"
                    )
                # data_amount is fixed
                layers.append(
                    layer_cls(**module.get('content', {}), **kwargs)
                )
            except Exception as e:
                raise ValueError(
                    f"detected an unexpected modules, "
                    f"some of module can't init like {layer_name} because {e}"
                )

        return layers

    def content_check(self):
        if len(self.layers) == 0:
            raise ValueError(
                f"detected an empty Sequential, "
                f"which can't calculate the output shape"
            )

    def init_code(
            self,
            package: str = "torch.nn",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        sub_layer_rvalues = functools.reduce(
            lambda x, y: x + y,
            tuple(layer.init_code(only_right_value=True) for layer in self.layers),
        )
        package_name = f"{package}." if package and not package.endswith(".") else package
        right_value = f"{package_name}{self._api_name}({', '.join(sub_layer_rvalues)})"
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
