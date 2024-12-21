# Copyright © 2024 PMoS. All rights reserved.

from typing import List, Tuple

from flowing.net.layer import Layer
from flowing.net.struct import NodeDataPair


class LayerNode:
    api_name: str
    layer_object: Layer = ...  # note: remember to init
    layer_init_kwargs: dict

    from_data: List[NodeDataPair] | Tuple[NodeDataPair, ...]

    def __init__(
            self, api_name: str,
            from_data: List[NodeDataPair] | Tuple[NodeDataPair, ...] | None,
            **kwargs
    ):
        self.api_name = api_name
        if from_data is None:
            self.from_data = tuple()
        else:
            self.from_data = from_data
        self.layer_init_kwargs = kwargs

    def __repr__(self):
        return f"LayerNode(api_name={self.api_name}, from_data={self.from_data}, layer_object={self.layer_object})"
