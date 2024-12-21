# Copyright © 2024 PMoS. All rights reserved.

from typing import List, Tuple

from flowing.net.struct import NodeDataPair


class InputNode:
    name: str
    shape: List[int] | Tuple[int, ...]
    to_data: List[NodeDataPair] | Tuple[NodeDataPair, ...]

    def __init__(
            self,
            shape: List[int] | Tuple[int, ...],
            to_data: List[NodeDataPair] | Tuple[NodeDataPair, ...],
            name: str = ...,
    ):
        self.name = name
        self.shape = shape
        self.to_data = to_data

    def __repr__(self):
        return f"InputNode(name='{self.name}', shape={self.shape}, to_net_idx={self.to_data})"
