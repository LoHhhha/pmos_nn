# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated, Iterable

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator
from flowing.net.layer.torch.common import TorchNNLayer

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
        return_indices = kwargs.get('return_indices', False)

        return OutputShapeCalculator.adaptive_pool(
            dim,
            self.output_size,
            return_indices,
            *input_shape,
        )


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
        return super().output_shape(
            *input_shape,
            return_indices=self.return_indices,
            **kwargs,
        )


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
                "expected AdaptiveMaxPool1d's output_size can not contain or be None"
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
