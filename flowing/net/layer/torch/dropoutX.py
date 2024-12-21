# Copyright © 2024 PMoS. All rights reserved.

from typing import Tuple, List

from flowing.net.layer import Layer

__all__ = [
    'Dropout',
    'Dropout1d',
    'Dropout2d',
    'Dropout3d',
]


class _Dropout(Layer):
    _api_name = ...

    p: float
    inplace: bool

    data_amount = 1
    output_amount = 1

    def __init__(self, p: float = 0.5, inplace: bool = False, data_amount: int | None = None):
        self.p = p
        self.inplace = inplace

        self._set_data(data_amount)

    def init_code(self, package: str = "torch.nn", add_self: bool = True):
        super().init_code()
        return (f"{"self." if add_self else ""}{self.layer_name} = {package}.{self._api_name}("
                f"p={self.p}, inplace={self.inplace})")

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        if len(input_shape) != self.data_amount:
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}"
            )

        # need dim and output_padding as args.
        dim = kwargs['dim']

        input_shape = input_shape[0]

        size = len(input_shape)
        if dim != -1 and size != dim + 1 and size != dim + 2:
            raise ValueError(
                f"Expected {dim + 1}D (unbatched) or {dim + 2}D (batched) input to {self._api_name}, "
                f"but got shape of input as: {input_shape}"
            )

        return tuple(input_shape),


class Dropout(_Dropout):
    _api_name = 'Dropout'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, dim=-1, **kwargs)


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
