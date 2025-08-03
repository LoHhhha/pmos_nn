# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated, Iterable

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer
from flowing.net.layer.torch.utils import get_and_check_target_dim_param

__all__ = [
    "AdaptiveAvgPool1d",
    "AdaptiveAvgPool2d",
    "AdaptiveAvgPool3d",
    "AdaptiveMaxPool1d",
    "AdaptiveMaxPool2d",
    "AdaptiveMaxPool3d",
]


class _AdaptivePool(TorchNNLayer):
    _api_name = ...

    data_amount = 1
    output_amount = ...

    output_size: Annotated[int | Tuple[Optional[int], ...], Layer.LayerContent]

    def __init__(
            self,
            output_size: int | Tuple[Optional[int], ...],
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)

        self.output_size = output_size

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim as args.
        dim = kwargs['dim']

        data_shape = list(input_shape[0])

        if len(data_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

        output_size = get_and_check_target_dim_param(self.output_size, dim, "output_size")

        for idx in range(dim):
            if output_size[idx] is not None:
                data_shape[-dim + idx] = output_size[idx]

        return tuple(data_shape),


class _AdaptiveAvgPool(_AdaptivePool):
    _api_name = ...

    data_amount = 1
    output_amount = 1


class _AdaptiveMaxPool(_AdaptiveAvgPool):
    _api_name = ...

    data_amount = 1
    output_amount = ...

    return_indices: Annotated[bool, Layer.LayerContent]

    def __init__(
            self,
            output_size: Optional[int] | Tuple[Optional[int], ...],
            return_indices: bool = False,
            data_amount: Optional[int] = None
    ):
        super().__init__(output_size=output_size, data_amount=data_amount)

        if return_indices:
            self.output_amount = 2
        else:
            self.output_amount = 1

        self.return_indices = return_indices

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = super().output_shape(*input_shape, **kwargs)[0]

        if self.return_indices:
            return data_shape, data_shape
        return data_shape,


class AdaptiveAvgPool1d(_AdaptiveAvgPool):
    _api_name = "AdaptiveAvgPool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        if self.output_size is None or \
                (isinstance(self.output_size, Iterable) and self.output_size.count(None)):
            raise ValueError(
                f"detect an unexpected output_size as {self.output_size}, "
                "expected AdaptivePool1d's output_size can not contain or be None"
            )
        return super().output_shape(*input_shape, dim=1)


class AdaptiveAvgPool2d(_AdaptiveAvgPool):
    _api_name = "AdaptiveAvgPool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class AdaptiveAvgPool3d(_AdaptiveAvgPool):
    _api_name = "AdaptiveAvgPool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)


class AdaptiveMaxPool1d(_AdaptiveMaxPool):
    _api_name = "AdaptiveMaxPool1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        if self.output_size is None or \
                (isinstance(self.output_size, Iterable) and self.output_size.count(None)):
            raise ValueError(
                f"detect an unexpected output_size as {self.output_size}, "
                "expected AdaptivePool1d's output_size can not contain or be None"
            )
        return super().output_shape(*input_shape, dim=1)


class AdaptiveMaxPool2d(_AdaptiveMaxPool):
    _api_name = "AdaptiveMaxPool2d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2)


class AdaptiveMaxPool3d(_AdaptiveMaxPool):
    _api_name = "AdaptiveMaxPool3d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3)
