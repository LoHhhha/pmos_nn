# Copyright © 2025 PMoS. All rights reserved.

import functools
import importlib
from typing import Optional, Annotated, Dict, Tuple, List, Any

from flowing.net.layer import Layer
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
            data_amount: Optional[int] = None
    ):
        """
        Args:
            modules: Tuple[{
                apiName: str,
                content: Dict[str, Any],
            }]
        """
        super().__init__(data_amount=data_amount)

        self.modules = modules
        self.layers = self._get_layers_from_modules()

    def _get_layers_from_modules(self):
        layers = []
        for module in self.modules:
            layer_name = module.get('apiName', None)
            if layer_name is None:
                raise ValueError(
                    f"get unexpected modules, some of module don't have apiName, modules={self.modules}"
                )

            try:
                layer_cls = importlib.import_module("flowing.net.layer.torch").__getattribute__(layer_name)
                if not issubclass(layer_cls, TorchNNLayer):
                    raise ValueError(
                        f"get unexpected layer {layer_name}, can't be push into Sequential"
                    )
                # data_amount is fixed
                layers.append(
                    layer_cls(**module.get('content', {}))
                )
            except Exception as e:
                raise ValueError(
                    f"get unexpected modules, some of module can't init like {layer_name} because {e}, "
                    f"modules={self.modules}"
                )

        return layers

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
        return f"{"self." if add_self else ""}{self.layer_name} = {right_value}",

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = tuple(input_shape[0])

        if len(self.layers) == 0:
            raise ValueError(
                f"detect an empty Sequential which can't calculate the output shape"
            )

        for idx, layer in enumerate(self.layers):
            try:
                data_shape = layer.output_shape(data_shape)[0]
            except Exception as e:
                raise ValueError(
                    f"detect error in {layer._api_name}(No.{idx + 1}): {e}"
                )

        return data_shape,
