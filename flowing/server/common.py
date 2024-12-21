# Copyright © 2024 PMoS. All rights reserved.

from typing import List

from starlette.responses import JSONResponse

from flowing.net.abstract import InputNode, OutputNode, LayerNode
from flowing.net.struct import NodeDataPair
from flowing.shower import Logger


def get_json_response(status_code: int = 200, msg: str = "OK", **kwargs):
    return JSONResponse(
        status_code=status_code,
        content={
            "msg": msg,
            **kwargs,
        })


def info_to_input_node(node: dict):
    """
    Raises:
        ValueError
    """
    to_data: List[NodeDataPair] = []
    if not isinstance(node.get("to_data", None), list):
        raise ValueError(
            f"InputNode not have expected to_data, node={node}"
        )
    for data_pair in node.get("to_data"):
        if not isinstance(data_pair, dict):
            raise ValueError(
                f"InputNode not have expected to_data, node={node}"
            )
        try:
            to_data.append(NodeDataPair(net_node_idx=data_pair["net_node_idx"], data_idx=data_pair["data_idx"]))
        except KeyError:
            raise ValueError(
                f"InputNode have an error to_data, node={node}"
            )

    if not isinstance(node.get("name", None), str):
        raise ValueError(
            f"InputNode not have expected name, node={node}"
        )

    if not isinstance(node.get("shape", None), list):
        raise ValueError(
            f"InputNode not have expected shape, node={node}"
        )

    try:
        input_node = InputNode(shape=node["shape"], to_data=to_data, name=node["name"])
    except Exception as e:
        raise ValueError(
            f"InputNode parse error due to {e}, node={node}"
        )
    return input_node


def info_to_output_node(node: dict):
    """
    Raises:
        ValueError
    """
    if not isinstance(node.get("from_data", None), dict):
        raise ValueError(
            f"OutputNode not have expected from_data, node={node}"
        )
    try:
        from_data: NodeDataPair = NodeDataPair(
            data_idx=node["from_data"]["data_idx"],
            net_node_idx=node["from_data"]["net_node_idx"]
        )
    except KeyError:
        raise ValueError(
            f"OutputNode have an error from_data, node={node}"
        )

    if not isinstance(node.get("name", None), str):
        raise ValueError(
            f"OutputNode not have expected name, node={node}"
        )

    try:
        output_node = OutputNode(from_data=from_data, name=node["name"])
    except Exception as e:
        raise ValueError(
            f"OutputNode parse error due to {e}, node={node}"
        )
    return output_node


def info_to_layer_node(node: dict):
    """
    Raises:
        ValueError
    """
    from_data: List[NodeDataPair | None] = []
    if not isinstance(node.get("from_data", None), list):
        Logger.error(f"One of node in net_nodes not have from_data, node={node}")
        raise ValueError(
            f"LayerNode not have from_data, node={node}"
        )
    for data_pair in node.get("from_data"):
        if data_pair is None:
            from_data.append(None)
            continue
        if not isinstance(data_pair, dict):
            raise ValueError(
                f"LayerNode have an error from_data, node={node}"
            )
        try:
            from_data.append(NodeDataPair(data_idx=data_pair["data_idx"], net_node_idx=data_pair["net_node_idx"]))
        except KeyError:
            raise ValueError(
                f"LayerNode have an error from_data, node={node}"
            )

    if not isinstance(node.get("args", None), list):
        raise ValueError(
            f"LayerNode not have expected args, node={node}"
        )
    args = {}
    for arg in node.get("args"):
        try:
            args[arg["key"]] = arg["value"]
        except KeyError:
            raise ValueError(
                f"LayerNode have an error args, node={node}"
            )

    if not isinstance(node.get("api_name", None), str):
        raise ValueError(
            f"LayerNode not have expected api_name, node={node}"
        )

    try:
        layer_node = LayerNode(api_name=node["api_name"], from_data=from_data, **args)
    except Exception as e:
        raise ValueError(
            f"LayerNode parse error due to {e}, node={node}"
        )
    return layer_node
