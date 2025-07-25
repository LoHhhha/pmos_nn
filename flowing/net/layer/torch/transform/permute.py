# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    "Permute",
]


class Permute(TorchLayer):
    _api_name = "permute"

    dims: Annotated[Tuple[int, ...], Layer.LayerForwardContent]

    data_amount = 1
    output_amount = 1

    def __init__(
            self,
            dims: Tuple[int, ...],
            data_amount: Optional[int] = None
    ):
        super().__init__(data_amount=data_amount)
        self.dims = dims

    @Layer.injected_check
    def forward_code(self, add_self: bool = False) -> Tuple[str, ...]:
        # add_self is useless
        return f"{self.output_name} = torch.{self._api_name}({self.get_forward_args(
            extend_params=self.get_contents(Layer.LayerForwardContent),
            data_names_tuple_name=["input"],
        )})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]

        length = len(self.dims)
        really_dims = tuple(dim if dim >= 0 else length + dim for dim in self.dims)

        dims_set = set(really_dims)
        if len(dims_set) != length:
            raise ValueError(
                f"detect an unexpected Permute param dims as {self.dims}, "
                f"expected it's items are different"
            )

        min_dim, max_dim = min(dims_set), max(dims_set)
        if min_dim != 0 or max_dim != length - 1:
            raise ValueError(
                f"detect an unexpected Permute param dims as {self.dims}, "
                f"expected it is a permutation of 0 to length-1 or -length to -1"
            )

        if length != len(data_shape):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's item has {length} dimensions"
            )

        result_shape = [0] * length
        try:
            for idx, dim in enumerate(really_dims):
                result_shape[idx] = data_shape[dim]
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it can find indexes of {self.dims}"
            )
        return tuple(result_shape),
