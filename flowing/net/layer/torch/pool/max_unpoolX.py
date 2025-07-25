# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    'MaxUnpool1d',
    'MaxUnpool2d',
    'MaxUnpool3d',
]


class _MaxUnpool(TorchNNLayer):
    _api_name = ...

    kernel_size: Annotated[int | Tuple[int, ...], Layer.LayerContent]
    stride: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]
    padding: Annotated[int | Tuple[int, ...], Layer.LayerContent]

    data_amount = 2
    output_amount = 1

    def __init__(
            self,
            kernel_size: int | Tuple[int, ...],
            stride: Optional[int | Tuple[int, ...]] = None,  # default: stride = kernel_size
            padding: int | Tuple[int, ...] = 0,
            data_amount: Optional[int] = None,
    ):
        super().__init__(data_amount=data_amount)
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim as args.
        dim = kwargs['dim']

        result_shape, info_shape = input_shape

        if tuple(result_shape) != tuple(info_shape):
            raise ValueError(
                f"detect an unexpected result_shape as {result_shape} or info_shape as {info_shape}, "
                f"expected both of shapes should be same."
            )

        if len(result_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"detect an unexpected result_shape as {result_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

        if isinstance(self.kernel_size, int):
            kernel_size = (self.kernel_size,) * dim
        else:
            kernel_size = self.kernel_size

        if isinstance(self.padding, int):
            padding = (self.padding,) * dim
        else:
            padding = self.padding

        if self.stride is None:
            stride = kernel_size
        elif isinstance(self.stride, int):
            stride = (self.stride,) * dim
        else:
            stride = self.stride

        output_shape = list(result_shape)

        for i in range(dim):
            output_shape[-dim + i] = (result_shape[-dim + i] - 1) * stride[i] - 2 * padding[i] + kernel_size[i]

        return tuple(output_shape),


class MaxUnpool1d(_MaxUnpool):
    _api_name = "MaxUnpool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1)


class MaxUnpool2d(_MaxUnpool):
    _api_name = "MaxUnpool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class MaxUnpool3d(_MaxUnpool):
    _api_name = "MaxUnpool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)
