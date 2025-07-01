# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer

__all__ = [
    "LazyBatchNorm1d",
    "LazyBatchNorm2d",
    "LazyBatchNorm3d",
    "BatchNorm1d",
    "BatchNorm2d",
    "BatchNorm3d",
    "LazyInstanceNorm1d",
    "LazyInstanceNorm2d",
    "LazyInstanceNorm3d",
    "InstanceNorm1d",
    "InstanceNorm2d",
    "InstanceNorm3d",
]


class _LazyBatchNorm(TorchNNLayer):
    _api_name = ...

    data_amount = 1
    output_amount = 1

    eps: Annotated[float, Layer.LayerContent]
    momentum: Annotated[Optional[float], Layer.LayerContent]
    affine: Annotated[bool, Layer.LayerContent]
    track_running_stats: Annotated[bool, Layer.LayerContent]

    def __init__(
            self,
            eps: float = 1e-5,
            momentum: Optional[float] = 0.1,
            affine: bool = True,
            track_running_stats: bool = True,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)

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
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape has {allowed_dims} dimensions"
            )

        return tuple(data_shape),


class _BatchNorm(_LazyBatchNorm):
    num_features: Annotated[int, Layer.LayerContent]

    def __init__(self, num_features: int, **kwargs):
        super().__init__(**kwargs)

        self.num_features = num_features

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # need allowed_dims as args
        allowed_dims: Tuple[int, ...] = kwargs['allowed_dims']

        # just call super().output_shape to check.
        super().output_shape(*input_shape, **kwargs)

        data_shape = input_shape[0]

        # data_shape dimension amount must in allowed_dims, due to super().output_shape
        allowed_dim_index = allowed_dims.index(len(data_shape))
        check_dim = allowed_dim_index if len(allowed_dims) == 2 else 1
        if self.num_features != data_shape[check_dim]:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape's NO.{check_dim + 1} dimension is equal to num_features as {self.num_features}"
            )
        return tuple(data_shape),


class _LazyInstanceNorm(_LazyBatchNorm):
    def __init__(
            self,
            affine: bool = False,
            track_running_stats: bool = False,
            **kwargs,
    ):
        super().__init__(
            affine=affine,
            track_running_stats=track_running_stats,
            **kwargs,
        )


class _InstanceNorm(_BatchNorm):
    def __init__(
            self,
            affine: bool = False,
            track_running_stats: bool = False,
            **kwargs,
    ):
        super().__init__(
            affine=affine,
            track_running_stats=track_running_stats,
            **kwargs,
        )


class LazyBatchNorm1d(_LazyBatchNorm):
    _api_name = "LazyBatchNorm1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(2, 3), **kwargs)


class LazyBatchNorm2d(_LazyBatchNorm):
    _api_name = 'LazyBatchNorm2d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(4,), **kwargs)


class LazyBatchNorm3d(_LazyBatchNorm):
    _api_name = 'LazyBatchNorm3d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(5,), **kwargs)


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


# note: LazyInstanceNormXd only supported to calculate when (N, ...)
class LazyInstanceNorm1d(_LazyInstanceNorm):
    _api_name = "LazyInstanceNorm1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(3,), **kwargs)


class LazyInstanceNorm2d(_LazyInstanceNorm):
    _api_name = 'LazyInstanceNorm2d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(4,), **kwargs)


class LazyInstanceNorm3d(_LazyInstanceNorm):
    _api_name = 'LazyInstanceNorm3d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(5,), **kwargs)


class InstanceNorm1d(_InstanceNorm):
    _api_name = "InstanceNorm1d"

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(2, 3), **kwargs)


class InstanceNorm2d(_InstanceNorm):
    _api_name = 'InstanceNorm2d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(3, 4), **kwargs)


class InstanceNorm3d(_InstanceNorm):
    _api_name = 'InstanceNorm3d'

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return super().output_shape(*input_shape, allowed_dims=(4, 5), **kwargs)
