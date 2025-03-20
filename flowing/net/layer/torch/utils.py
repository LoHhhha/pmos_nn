# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Iterable


def get_and_check_target_dim_param(
        param: int | Tuple[int, ...] | List[int], dim: int, param_name: str = "param"
) -> Tuple[int, ...]:
    if isinstance(param, int):
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
    return tuple(param)
