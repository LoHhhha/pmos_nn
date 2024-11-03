# Copyright © 2024 PMoS. All rights reserved.

import torch

from flowing.net.parser import TorchParser
from flowing.net.abstract import LayerNode, InputNode, OutputNode
from flowing.net.struct import NodeDataPair


def e2e_net():
    # 1 date to 1 data, pixel to pixel
    net_nodes = [
        LayerNode(
            api_name="Identity",
            from_data=None,
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=0),),
            **{"in_channels": 3, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=1),),
            **{"in_channels": 16, "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=1),),
            **{"in_channels": 16, "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Add",
            from_data=(NodeDataPair(net_node_idx=2), NodeDataPair(net_node_idx=3)),
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=4),),
            **{"in_channels": 32, "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="ReLU",
            from_data=(NodeDataPair(net_node_idx=5),),
            **{}
        ),
    ]

    input_nodes = [
        InputNode(
            shape=(1, 3, 128, 256),
            to_data=(NodeDataPair(net_node_idx=0),),
        ),
    ]

    output_nodes = [
        OutputNode(
            from_data=NodeDataPair(net_node_idx=6),
        ),
    ]

    parser = TorchParser(input_nodes=input_nodes, net_nodes=net_nodes, output_nodes=output_nodes, network_name="DNet")

    net = parser.network_class(save_path="./E2ENet.py")()

    # test forward
    net(torch.rand(1, 3, 128, 256))


def m2m_net():
    # 2 data to 2 data network, also e2e
    net_nodes = [
        LayerNode(
            api_name="Conv2d",
            from_data=None,
            **{"in_channels": 3, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=None,
            **{"in_channels": 3, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Add",
            from_data=(NodeDataPair(net_node_idx=0), NodeDataPair(net_node_idx=1)),
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=2),),
            **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=3),),
            **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=2),),
            **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="Conv2d",
            from_data=(NodeDataPair(net_node_idx=5),),
            **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
        ),
        LayerNode(
            api_name="ReLU",
            from_data=(NodeDataPair(net_node_idx=4),),
            **{}
        ),
        LayerNode(
            api_name="ReLU",
            from_data=(NodeDataPair(net_node_idx=6),),
            **{}
        ),
    ]

    input_nodes = [
        InputNode(
            shape=(1, 3, 128, 256),
            to_data=(NodeDataPair(net_node_idx=0),),
        ),
        InputNode(
            shape=(1, 3, 128, 256),
            to_data=(NodeDataPair(net_node_idx=1),),
        ),
    ]

    output_nodes = [
        OutputNode(
            from_data=NodeDataPair(net_node_idx=7),
        ),
        OutputNode(
            from_data=NodeDataPair(net_node_idx=8),
        ),
    ]

    parser = TorchParser(input_nodes=input_nodes, net_nodes=net_nodes, output_nodes=output_nodes, network_name="MNet")

    net = parser.network_class(save_path="./M2MNet.py")()

    # test forward
    net(torch.rand(1, 3, 128, 256), torch.rand(1, 3, 128, 256))


if __name__ == "__main__":
    e2e_net()
    m2m_net()
