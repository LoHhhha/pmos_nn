# Copyright © 2024 PMoS. All rights reserved.

from typing import List, Tuple
from abc import ABC, abstractmethod

__all__ = [
    'Layer'
]


class Layer(ABC):
    _api_name: str = ...

    layer_name: str = ...
    data_names: List[str | None] = ...
    data_amount: int = ...
    output_name: str = ...  # through it maybe a tuple but also use one name.
    output_amount: int = ...  # when output_size == 1 means output_name is a var, or it is a tuple.

    def _set_data(self, data_amount: int | None = None) -> None:
        if data_amount is not None:
            if self.data_amount is ...:
                self.data_amount = data_amount
            elif self.data_amount != data_amount:
                raise ValueError(
                    f'{self._api_name}.data_amount expected to be {self.data_amount}, but got {data_amount}'
                )
        elif self.data_amount is ...:
            raise ValueError(
                f'{self._api_name}.data_amount need to be implement'
            )

        self.data_names = [None] * self.data_amount

    def _get_args(self, block: str = ", ") -> str:
        # ensure data_name is not ...
        n = len(self.data_names)
        args = ""
        for idx in range(n):
            args += self.data_names[idx] + (block if idx + 1 != n else "")
        return args

    # call and implement
    def init_code(self):
        if self.layer_name is ...:
            raise NotImplementedError(
                "please first assign the Layer.layer_name before you call Layer.init_code()"
            )

    # override
    def forward_code(self, add_self: bool = True):
        if self.layer_name is ... or self.output_name is ... or self.data_names is ...:
            raise NotImplementedError(
                "please first assign the Layer.layer_name, Layer.output_name and Layer.data_name before you call "
                "Layer.forward_code()"
            )
        return f"{self.output_name} = {"self." if add_self else ""}{self.layer_name}({self._get_args()})"

    @abstractmethod
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        """
        Return what shape of date will get if push [input_shape] data to Layer.
        """
        ...

    def __repr__(self):
        return f"Layer:{self._api_name}(data_amount={self.data_amount},output_amount={self.output_amount})"
