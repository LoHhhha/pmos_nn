# Copyright © 2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.shape_helper import OutputShapeCalculator, DataShapeChecker
from flowing.net.layer.torch.common import TorchNNLayer


class _SimpleActivation(TorchNNLayer):
    data_amount = 1
    output_amount = 1

    @Layer.input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        return OutputShapeCalculator.same_as_input_shape(*input_shape)


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
        result = super().output_shape(*input_shape, **kwargs)

        # check if dim exist in input_shape
        for shape in input_shape:
            DataShapeChecker.exist_dim(shape, self.dim)

        return result


class _LambdActivation(_SimpleActivation):
    lambd: Annotated[float, Layer.LayerContent]

    def __init__(self, lambd: float = 0.5, **kwargs):
        super().__init__(**kwargs)

        self.lambd = lambd
