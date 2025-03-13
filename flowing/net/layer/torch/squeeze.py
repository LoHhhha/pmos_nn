# Copyright © 2024-2025 PMoS. All rights reserved.

from collections.abc import Iterable
from typing import Tuple, List, Optional, Annotated

from flowing.net.layer import Layer

__all__ = [
    "Squeeze",
    "Unsqueeze"
]


class Squeeze(Layer):
    _api_name = "squeeze"

    dim: Annotated[Optional[int | Tuple[int, ...]], Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dim: Optional[int | Tuple[int, ...]] = None,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.dim = dim

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        # add_self is useless
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        if self.dim is None:
            return f"{self.output_name} = torch.{self._api_name}(input={self.data_names[0]})",
        return f"{self.output_name} = torch.{self._api_name}(input={self.data_names[0]}, dim={self.dim})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]
        result_shape = list(data_shape)

        if self.dim is None:
            result_shape = [x for x in result_shape if x != 1]
            return tuple(result_shape),

        if isinstance(self.dim, Iterable):
            dims = self.dim
        elif isinstance(self.dim, int):
            dims = [self.dim]
        else:
            raise ValueError(
                f"detect an unexpected Squeeze params dim as {self.dim}, "
                f"has type {type(self.dim)}"
            )

        need_remove_dims = set()
        for dim in dims:
            try:
                if result_shape[dim] == 1:
                    need_remove_dims.add(dim)
            except IndexError:
                raise ValueError(
                    f"detect an unexpected data_shape as {data_shape}, "
                    f"expected it's item has at least {dim + 1 if dim >= 0 else abs(dim)} dimensions"
                )

        result_shape = [result_shape[idx] for idx in range(len(result_shape)) if idx not in need_remove_dims]
        return tuple(result_shape),


class Unsqueeze(Layer):
    _api_name = "unsqueeze"

    dim: Annotated[int, Layer.LayerContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dim: int,
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.dim = dim

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        # add_self is useless
        return ()

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return f"{self.output_name} = torch.{self._api_name}(input={self.data_names[0]}, dim={self.dim})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = list(input_shape[0])

        padding_num = -1
        result_shape = [padding_num] * (len(data_shape) + 1)
        try:
            result_shape[self.dim] = 1
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's item has at least {self.dim + 1 if self.dim >= 0 else abs(self.dim)} dimensions"
            )

        rs_idx = 0
        for idx in range(len(data_shape)):
            while result_shape[rs_idx] != padding_num:
                rs_idx += 1
            result_shape[rs_idx] = data_shape[idx]
            rs_idx += 1

        return tuple(result_shape),
