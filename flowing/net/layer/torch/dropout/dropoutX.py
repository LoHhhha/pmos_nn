# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    'Dropout',
    'Dropout1d',
    'Dropout2d',
    'Dropout3d',
    'AlphaDropout',
    'FeatureAlphaDropout',
]


class _Dropout(TorchNNLayer):
    _api_name = ...

    p: Annotated[float, Layer.LayerContent]
    inplace: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, p: float = 0.5, inplace: bool = False, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.p = p
        self.inplace = inplace

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need dim and output_padding as args.
        dim = kwargs.get('dim', -1)
        at_least_two = kwargs.get('at_least_two', False)

        data_shape = input_shape[0]

        if at_least_two and len(data_shape) < 2:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape at least 2 dimension"
            )

        size = len(data_shape)
        if dim != -1 and size != dim + 1 and size != dim + 2:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

        return tuple(data_shape),


class Dropout(_Dropout):
    _api_name = 'Dropout'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, **kwargs)


class Dropout1d(_Dropout):
    _api_name = 'Dropout1d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=1, **kwargs)


class Dropout2d(_Dropout):
    _api_name = 'Dropout2d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=2, **kwargs)


class Dropout3d(_Dropout):
    _api_name = 'Dropout3d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=3, **kwargs)


class AlphaDropout(_Dropout):
    _api_name = 'AlphaDropout'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, **kwargs)


class FeatureAlphaDropout(_Dropout):
    _api_name = 'FeatureAlphaDropout'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, at_least_two=True, **kwargs)
