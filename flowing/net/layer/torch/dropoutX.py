# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated

from flowing.net.layer import Layer

__all__ = [
    'Dropout',
    'Dropout1d',
    'Dropout2d',
    'Dropout3d',
]


class _Dropout(Layer):
    _api_name = ...

    p: Annotated[float, Layer.LayerContent]
    inplace: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(self, p: float = 0.5, inplace: bool = False, data_amount: int | None = None):
        super().__init__(data_amount=data_amount)
        self.p = p
        self.inplace = inplace

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
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
