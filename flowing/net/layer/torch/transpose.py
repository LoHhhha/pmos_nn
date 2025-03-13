# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer

__all__ = [
    "Transpose",
]


class Transpose(Layer):
    _api_name = "transpose"

    dim0: Annotated[int, Layer.LayerContent]
    dim1: Annotated[int, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dim0: int,
            dim1: int,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.dim0 = dim0
        self.dim1 = dim1

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        # add_self is useless
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return f"{self.output_name} = torch.{self._api_name}(input={self.data_names[0]}, dim0={self.dim0}, dim1={self.dim1})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]
        result_shape = list(data_shape)
        try:
            dim_shape = result_shape[self.dim0]
            result_shape[self.dim0] = result_shape[self.dim1]
            result_shape[self.dim1] = dim_shape
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's item has index {self.dim0} and {self.dim1} at least"
            )
        return tuple(result_shape),
