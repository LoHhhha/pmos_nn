# Copyright © 2025 PMoS. All rights reserved.

from typing import List, Tuple

from flowing.net.layer.utils import get_and_check_target_dim_param


def mindspore_data_check(data_shape: List[int] | Tuple[int, ...], dim: int):
    # mindspore only support (N, C, ...)
    if len(data_shape) != (dim + 2):
        raise ValueError(
            f"detected an unexpected data_shape as {data_shape}, "
            f"expecting data_shape has {dim + 2} dimension"
        )


def mindspore_padding_check(pad_mode: str, padding: int | List[int] | Tuple[int], dim: int):
    if pad_mode == "same":
        if padding != 0:
            raise ValueError(
                f"detected an unexpected padding as {padding} or pad_mode as {pad_mode}, "
                f"expecting padding should be 0 when pad_mode is 'same'"
            )
    elif pad_mode == "valid":
        if padding != 0:
            raise ValueError(
                f"detected an unexpected padding as {padding} or pad_mode as {pad_mode}, "
                f"expecting padding should be 0 when pad_mode is 'valid'"
            )
    elif pad_mode == "pad":
        # each dim has 2 directions to padding
        _ = get_and_check_target_dim_param(padding, 2 * dim, 0, "padding")
    else:
        raise ValueError(
            f"detected an unexpected pad_mode as {pad_mode}, "
            f"expecting pad_mode should be one of 'pad', 'valid' or 'same'"
        )
