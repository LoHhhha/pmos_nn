# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer

__all__ = [
    "BatchNorm1d",
    "BatchNorm2d",
    "BatchNorm3d",
]


class _BatchNorm(Layer):
    _api_name = ...

    num_features: Annotated[int, Layer.LayerContent]
    eps: Annotated[float, Layer.LayerContent]
    momentum: Annotated[Optional[float], Layer.LayerContent]
    affine: Annotated[bool, Layer.LayerContent]
    track_running_stats: Annotated[bool, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            num_features: int,
            eps: float = 1e-5,
            momentum: Optional[float] = 0.1,
            affine: bool = True,
            track_running_stats: bool = True,
            data_amount: int | None = None
    ):
        super().__init__(data_amount=data_amount)
        self.num_features = num_features
        self.eps = eps
        self.momentum = momentum
        self.affine = affine
        self.track_running_stats = track_running_stats

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need allowed_dims as args.
        allowed_dims = kwargs['allowed_dims']

        data_shape = input_shape[0]
        if len(data_shape) not in allowed_dims:
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}, "
                f"expected input_shape has {allowed_dims} dimensions"
            )

        # data_shape dimensions >=2
        if self.num_features != data_shape[1]:
            raise ValueError(
                f"detect an unexpected input_shape as {input_shape}, "
                f"expected input_shape's 2nd dimension is {self.num_features}"
            )
        return tuple(data_shape),


class BatchNorm1d(_BatchNorm):
    _api_name = 'BatchNorm1d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(2, 3), **kwargs)


class BatchNorm2d(_BatchNorm):
    _api_name = 'BatchNorm2d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(4,), **kwargs)


class BatchNorm3d(_BatchNorm):
    _api_name = 'BatchNorm3d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(5,), **kwargs)
