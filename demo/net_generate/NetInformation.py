# Copyright © 2025 PMoS. All rights reserved.

from flowing.net.abstract import LayerNode, InputNode, OutputNode
from flowing.net.struct import NodeDataPair


# 1 date to 1 data, pixel to pixel
def get_e2e_net_info(is_mindspore: bool = False):
    return {
        "net_nodes": [
            LayerNode(
                api_name="Identity",
                from_data=None,
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=0),),
                **{"in_channels": 3, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=1),),
                **{"in_channels": 16, "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=1),),
                **{"in_channels": 16, "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Add",
                from_data=(NodeDataPair(net_node_idx=2), NodeDataPair(net_node_idx=3)),
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=4),),
                **{"in_channels": 32, "out_channels": 32, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="ReLU",
                from_data=(NodeDataPair(net_node_idx=5),),
                **{}
            ),
        ],

        "input_nodes": [
            InputNode(
                shape=(1, 3, 128, 256),
                to_data=(NodeDataPair(net_node_idx=0),),
            ),
        ],

        "output_nodes": [
            OutputNode(
                from_data=NodeDataPair(net_node_idx=6),
            ),
        ]
    }


# 2 data to 2 data network, also e2e
def get_m2m_net_info(is_mindspore: bool = False):
    return {
        "net_nodes": [
            LayerNode(
                api_name="Conv2d",
                from_data=None,
                **{"in_channels": 3, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=None,
                **{"in_channels": 3, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Add",
                from_data=(NodeDataPair(net_node_idx=0), NodeDataPair(net_node_idx=1)),
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=2),),
                **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=3),),
                **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=2),),
                **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
            ),
            LayerNode(
                api_name="Conv2d",
                from_data=(NodeDataPair(net_node_idx=5),),
                **{"in_channels": 16, "out_channels": 16, "kernel_size": 3, "stride": 1, "padding": 1},
                **({"pad_mode": "pad"} if is_mindspore else {})
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
        ],

        "input_nodes": [
            InputNode(
                shape=(1, 3, 128, 256),
                to_data=(NodeDataPair(net_node_idx=0),),
            ),
            InputNode(
                shape=(1, 3, 128, 256),
                to_data=(NodeDataPair(net_node_idx=1),),
            ),
        ],

        "output_nodes": [
            OutputNode(
                from_data=NodeDataPair(net_node_idx=7),
            ),
            OutputNode(
                from_data=NodeDataPair(net_node_idx=8),
            ),
        ],
    }
