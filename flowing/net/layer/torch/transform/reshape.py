# Copyright © 2024-2025 PMoS. All rights reserved.

from functools import reduce
from typing import Tuple, List, Annotated, Optional

from flowing.net.layer import Layer
from flowing.net.layer.torch.common import TorchLayer

__all__ = [
    'Reshape'
]


class Reshape(TorchLayer):
    _api_name = "reshape"

    shape: Annotated[Tuple[int, ...], Layer.LayerForwardContent]

    __shape_mul: int = ...

    data_amount = 1
    output_amount = 1

    def __init__(self, output_shape, data_amount: Optional[int] = None):
        super().__init__(data_amount=data_amount)
        self.shape = output_shape
        self.__shape_mul = reduce(lambda x, y: x * y, self.shape)

    @Layer.named_check
    def init_code(self, package: str = "torch.nn", add_self: bool = True) -> Tuple[str, ...]:
        return ()

    @Layer.injected_check
    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # identifier is useless
        return f"{self.output_name} = torch.{self._api_name}({self.get_forward_args(
            extend_params=self.get_contents(Layer.LayerForwardContent),
            data_names_tuple_name=["input"],
        )})",

    @Layer.input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        data_shape = input_shape[0]
        data_shape_mul = reduce(lambda x, y: x * y, data_shape)

        neg_count = len([x for x in self.shape if x < 0])
        if neg_count > 1:
            raise ValueError(
                f"detect an unexpected Reshape params shape as {self.shape}, "
                f"having more than one negative number"
            )
        if neg_count:
            neg_idx = -1
            output_mul = 1
            for idx, num in enumerate(self.shape):
                if num < 0:
                    if num != -1:
                        raise ValueError(
                            f"detect an unexpected Reshape params shape as {self.shape}, "
                            f"having negative number but not -1"
                        )
                    else:
                        neg_idx = idx
                else:
                    output_mul *= num
            output_shape = list(self.shape)
            if output_mul > data_shape_mul or output_mul == 0 or data_shape_mul % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected data_shape as {data_shape}, "
                    f"which cannot reshape to {self.shape}"
                )
            output_shape[neg_idx] = data_shape_mul // output_mul
            return tuple(output_shape),

        if data_shape_mul != self.__shape_mul:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's result of shape multiplication is {self.__shape_mul}"
            )

        return tuple(self.shape),
