# Copyright © 2024 PMoS. All rights reserved.

class NodeDataPair:
    net_node_idx: int
    data_idx: int  # input or output place, such as net(var0, var1) var0 data_idx=0.

    def __init__(self, net_node_idx: int, data_idx: int = 0):
        self.net_node_idx = net_node_idx
        self.data_idx = data_idx

    def __repr__(self):
        return f"NodeDataPair(net_node_idx={self.net_node_idx}, data_idx={self.data_idx})"
