# Copyright © 2024 PMoS. All rights reserved.

from flowing.net.struct import NodeDataPair


class OutputNode:
    name: str = ...
    data_name: str = ...
    from_data: NodeDataPair

    def __init__(self, from_data: NodeDataPair, name: str = ..., data_name: str = ...):
        self.name = name
        self.from_data = from_data
        self.data_name = data_name

    def forward_code(self, add_self: bool = False):
        if self.name is ... or self.data_name is ...:
            raise NotImplementedError(
                "please first assign the OutputNode.name and OutputNode.data_name before you call "
                "OutputNode.forward_code()"
            )
        return f"{'self.' if add_self else ''}{self.name} = {self.data_name}"

    def __repr__(self):
        return f"OutputNode(from_data={self.from_data}, data_name={self.data_name}, name={self.name})"
