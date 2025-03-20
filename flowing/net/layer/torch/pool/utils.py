# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List


def padding_and_kernel_size_check(
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
