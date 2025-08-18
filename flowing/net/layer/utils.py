# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Iterable, Optional


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
                f"detect an unexpected {param_name} as {param}({type(param)}), "
                f"expected it is an at least {at_least} int or None"
            )
        return (param,) * dim
    elif not isinstance(param, Iterable):
        raise ValueError(
            f"detect an unexpected {param_name} as {param}({type(param)}), "
            f"expected it is an integer or a iterable of length {dim}"
        )
    elif len(param) != dim:
        raise ValueError(
            f"detect an unexpected {param_name} as {param}, "
            f"expected it is an integer or a iterable of length {dim}"
        )
    elif len([val for val in param if val is not None and val < at_least]):
        raise ValueError(
            f"detect an unexpected {param_name} as {param}({type(param)}), "
            f"expected it is containing at least {at_least} int or None"
        )
    return tuple(param)


def pool_padding_and_kernel_size_check(
        padding: Tuple[int, ...] | List[int],
        kernel_size: Tuple[int, ...] | List[int],
):
    if len(kernel_size) != len(padding):
        raise ValueError(
            f"detect an unexpected kernel_size as {kernel_size} or padding as {padding}, "
            f"expected same length"
        )

    # rule1: pad should be at most half of effective kernel size
    for idx, k in enumerate(kernel_size):
        if k < padding[idx] * 2:
            raise ValueError(
                f"detect an unexpected kernel_size as {kernel_size} or padding as {padding}, "
                f"expected pad should be at most half of effective kernel size"
            )
