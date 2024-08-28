# Copyright © 2024 PMoS. All rights reserved.

from typing import Tuple


class Base:
    # total, using to build other sdk.
    # using this first to check all the vars is ready.
    in_channels: int
    out_channels: int
    kernel_size: int | Tuple[int, ...]
    stride: int | Tuple[int, ...]
    padding: int | Tuple[int, ...]
    padding_mode: str
    dilation: int | Tuple[int, ...]
    groups: int
    bias: bool
    output_padding: int | Tuple[int, ...]
    return_indices: bool
    ceil_mode: bool

    def __init__(self, *args, **kwargs):
        raise NotImplementedError("BaseLayer will not be implemented.")








