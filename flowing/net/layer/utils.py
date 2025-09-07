# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Iterable, Optional, Any, Dict

from flowing.net.layer.layer_init_helper import LayerInitHelper


def get_and_check_target_dim_param(
        param: Optional[int] | Tuple[Optional[int], ...] | List[Optional[int]],
        dim: int,
        at_least: int,
        param_name: str = "param"
) -> Tuple[Optional[int], ...]:
    """
    Check:
        - type
        - val is None or val >= 0
    Return:
        [param_val*dim]

    may raise ValueError
    """
    if isinstance(param, int) or param is None:
        if isinstance(param, int) and param < at_least:
            raise ValueError(
                f"detected an unexpected {param_name} as {param}({type(param)}), "
                f"expecting it is an at least {at_least} or maybe can be None"
            )
        return (param,) * dim
    elif not isinstance(param, Iterable):
        raise ValueError(
            f"detected an unexpected {param_name} as {param}({type(param)}), "
            f"expecting it is an integer or a iterable of length {dim}"
        )
    elif len(param) != dim:
        raise ValueError(
            f"detected an unexpected {param_name} as {param}, "
            f"expecting it is an integer or a iterable of length {dim}"
        )
    elif len([val for val in param if val is not None and val < at_least]):
        raise ValueError(
            f"detected an unexpected {param_name} as {param}({type(param)}), "
            f"expecting it is containing at least {at_least} int or None"
        )
    return tuple(param)


def pool_padding_and_kernel_size_check(
        padding: Tuple[int, ...] | List[int],
        kernel_size: Tuple[int, ...] | List[int],
):
    if len(kernel_size) != len(padding):
        raise ValueError(
            f"detected an unexpected kernel_size as {kernel_size} or padding as {padding}, "
            f"expecting kernel_size and padding has same length"
        )

    # rule1: pad should be at most half of effective kernel size
    for idx, k in enumerate(kernel_size):
        if k < padding[idx] * 2:
            raise ValueError(
                f"detected an unexpected kernel_size as {kernel_size} or padding as {padding}, "
                f"expecting pad should be at most half of effective kernel size"
            )


def get_layers_from_modules(
        modules: Tuple[Dict[str, str | Dict]] | List[Dict[str, str | Dict]],
        package_name: str,
        accept_layer_cls: List[Any] | Tuple[Any] | None = None,
        extend_init_kwargs: Dict[str, Any] | None = None,
):
    """
    modules: {
        "apiName": "xxx",
        "content": {"key": value},
    }
    """
    layers = []
    for module in modules:
        layer_name = module.get('apiName', None)
        if not isinstance(layer_name, str) or layer_name is None:
            raise ValueError(
                f"detected an unexpected modules, "
                f"some of module don't have apiName or have unexpected apiName"
            )

        try:
            layer_cls = LayerInitHelper.get_layer_cls(
                package_name=package_name,
                layer_name=layer_name
            )

            if accept_layer_cls is not None:
                is_valid_layer = False
                for accept_cls in accept_layer_cls:
                    if issubclass(layer_cls, accept_cls):
                        is_valid_layer = True
                        break
                if not is_valid_layer:
                    raise ValueError(
                        f"detected an unexpected layer {layer_name}, "
                        f"which can't be push into Sequential"
                    )

            if extend_init_kwargs is None:
                extend_init_kwargs = {}
            # data_amount is fixed

            layer_kwargs = module.get('content', {})
            if not isinstance(layer_kwargs, dict):
                raise ValueError(
                    f"detected an unexpected layer_kwargs {layer_kwargs}, "
                    f"expecting layer_kwargs is a dict"
                )

            layers.append(
                layer_cls(**layer_kwargs, **extend_init_kwargs)
            )
        except Exception as e:
            raise ValueError(
                f"detected an unexpected modules, "
                f"some of module can't init like {layer_name} because {e}"
            )

    return layers


def type_check(data: Any, cls: Any, data_name: str, api_name: str):
    if not isinstance(data, cls):
        raise ValueError(
            f"detected an unexpected {data_name} as {data}({type(data)}), "
            f"expecting {data_name} must be {cls.__name__} in {api_name}"
        )
