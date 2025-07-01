# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchNNLayer


class _SimpleActivation(TorchNNLayer):
    data_amount = 1
    output_amount = 1

    def __init__(self, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]
        return tuple(data_shape),

    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return super().init_code(package=package, add_self=add_self)


class _InplaceActivation(_SimpleActivation):
    inplace: Annotated[bool, Layer.LayerContent]

    def __init__(self, inplace: bool = False, **kwargs):
        super().__init__(**kwargs)
        self.inplace = inplace


class _OptionalDimActivation(_SimpleActivation):
    dim: Annotated[Optional[int], Layer.LayerContent]

    def __init__(self, dim: Optional[int] = None, **kwargs):
        super().__init__(**kwargs)

        self.dim = dim

    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        # check super()
        super().output_shape(*input_shape, **kwargs)

        data_shape = input_shape[0]

        if self.dim is not None:
            try:
                data_shape[self.dim]
            except IndexError:
                raise ValueError(
                    f"detect an unexpected data_shape as {data_shape}, "
                    f"expected data_shape should have {self.dim} dimension"
                )

        return tuple(data_shape),


class _LambdActivation(_SimpleActivation):
    lambd: Annotated[float, Layer.LayerContent]

    def __init__(self, lambd: float = 0.5, **kwargs):
        super().__init__(**kwargs)

        self.lambd = lambd
