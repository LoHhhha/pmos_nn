# Copyright © 2024-2025 PMoS. All rights reserved.

import math
from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.torch.pool.utils import padding_and_kernel_size_check
from flowing.net.layer.torch.utils import get_and_check_target_dim_param

__all__ = [
    'MaxPool1d',
    'MaxPool2d',
    'MaxPool3d',
]


class _MaxPool(TorchNNLayer):
    _api_name = ...

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    dilation: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    return_indices: Annotated[bool, Layer.LayerContent]
    ceil_mode: Annotated[bool, Layer.LayerContent]

    data_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            dilation: int | Tuple[int, ...] = 1,
            return_indices: bool = False,
            ceil_mode: bool = False,
            data_amount: Optional[int] = None,
    ):
        super().__init__(data_amount=data_amount)
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.dilation = dilation
        self.return_indices = return_indices
        self.ceil_mode = ceil_mode

        if self.return_indices:
            self.output_amount = 2
        else:
            self.output_amount = 1

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim as args.
        dim = kwargs['dim']

        data_shape = input_shape[0]

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
        dilation = get_and_check_target_dim_param(self.dilation, dim, "dilation")

        padding_and_kernel_size_check(padding=padding, kernel_size=kernel_size)

        result_shape = list(data_shape)
        for i in range(dim):
            result_shape[-dim + i] = math.floor(
                (data_shape[-dim + i] + 2 * padding[i] - dilation[i] * (kernel_size[i] - 1) - 1) / stride[i] + 1
            )

        if self.return_indices:
            info_shape = list(result_shape)
            return tuple(result_shape), tuple(info_shape)
        return tuple(result_shape),


class MaxPool1d(_MaxPool):
    _api_name = "MaxPool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class MaxPool2d(_MaxPool):
    _api_name = "MaxPool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class MaxPool3d(_MaxPool):
    _api_name = "MaxPool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)
