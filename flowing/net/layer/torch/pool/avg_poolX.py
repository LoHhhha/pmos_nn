# Copyright © 2025 PMoS. All rights reserved.

import math
from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.torch.pool.utils import padding_and_kernel_size_check
from flowing.net.layer.torch.utils import get_and_check_target_dim_param

__all__ = [
    'AvgPool1d',
    'AvgPool2d',
    'AvgPool3d',
]


class _AvgPool(TorchNNLayer):
    _api_name = ...

    data_amount = 1
    output_amount = 1

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    ceil_mode: Annotated[bool, Layer.LayerContent]
    count_include_pad: Annotated[bool, Layer.LayerContent]

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,
            padding: int | Tuple[int, ...] = 0,
            ceil_mode: bool = False,
            count_include_pad: bool = True,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)

        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.ceil_mode = ceil_mode
        self.count_include_pad = count_include_pad

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim as args.
        dim = kwargs['dim']

        data_shape = list(input_shape[0])

        if len(data_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

        kernel_size = get_and_check_target_dim_param(self.kernel_size, dim, "kernel_size")
        padding = get_and_check_target_dim_param(self.padding, dim, "padding")
        stride = get_and_check_target_dim_param(
            self.kernel_size if self.stride is None else self.stride, dim, "stride"
        )

        padding_and_kernel_size_check(padding=padding, kernel_size=kernel_size)

        for idx in range(dim):
            data_shape[-dim + idx] = math.floor(
                (data_shape[-dim + idx] + 2 * padding[-dim + idx] - kernel_size[-dim + idx]) / stride[-dim + idx] + 1
            )
        return tuple(data_shape),


class AvgPool1d(_AvgPool):
    _api_name = "AvgPool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class AvgPool2d(_AvgPool):
    _api_name = "AvgPool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class AvgPool3d(_AvgPool):
    _api_name = "AvgPool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)
