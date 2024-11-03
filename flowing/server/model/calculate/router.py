import json
import os.path

from flowing.server.config import MODEL_RESULT_PATH
from flowing.shower import Logger
from typing import List, Dict

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from flowing.net.abstract import InputNode, OutputNode, LayerNode
from flowing.net.parser import TorchParser
from flowing.net.struct import NodeDataPair
from flowing.server.common import get_json_response
from flowing.server.expection import JSONParseException, JSONTypeException, NoInputNodesException, \
    NoOutputNodesException, NoNetNodesException, InputNodesParseException, OutputNodesParseException, \
    NetNodesParseException
from flowing.server.model.calculate.models import ModelCalculateRequest, JSON_PARSE_ERROR_RESPONSE, \
    JSON_NOT_DICT_ERROR_RESPONSE, NOT_INPUT_NODES_ERROR_RESPONSE, NOT_OUTPUT_NODES_ERROR_RESPONSE, \
    NOT_NET_NODES_ERROR_RESPONSE, INPUT_NODES_PARSE_ERROR_RESPONSE, OUTPUT_NODES_PARSE_ERROR_RESPONSE, \
    NET_NODES_PARSE_ERROR_RESPONSE

router = APIRouter(
    prefix="/calculate",
    tags=["calculate"],
)


def _parse_graph(data: str) -> (List[InputNode], List[OutputNode], List[NodeDataPair]):
    try:
        info = json.loads(data)
    except json.JSONDecodeError as e:
        Logger.error(f"JSON parse fail due to:{e}, data={data}")
        raise JSONParseException

    if not isinstance(info, dict):
        Logger.error(f"Info type is {type(info)} expected dict")
        raise JSONTypeException

    if not isinstance(info.get("input_nodes", None), list):
        Logger.error(f"Info not have input_nodes, info={info}")
        raise NoInputNodesException

    if not isinstance(info.get("output_nodes", None), list):
        Logger.error(f"Info not have output_nodes, info={info}")
        raise NoOutputNodesException

    if not isinstance(info.get("net_nodes", None), list):
        Logger.error(f"Info not have net_nodes, info={info}")
        raise NoNetNodesException

    input_nodes: List[InputNode] = []
    for node in info.get("input_nodes"):
        to_data: List[NodeDataPair] = []
        if not isinstance(node.get("to_data", None), list):
            Logger.error(f"One of node in input_nodes not have to_data, node={node}")
            raise InputNodesParseException
        for data_pair in node.get("to_data"):
            if not isinstance(data_pair, dict):
                Logger.error(f"One of node in input_nodes have an error to_data, node={node}")
                raise NetNodesParseException
            try:
                to_data.append(NodeDataPair(net_node_idx=data_pair["net_node_idx"], data_idx=data_pair["data_idx"]))
            except KeyError:
                Logger.error(f"One of node in input_nodes have an error to_data, node={node}")
                raise InputNodesParseException

        if not isinstance(node.get("name", None), str):
            Logger.error(f"One of node in input_nodes not have name, node={node}")
            raise InputNodesParseException

        try:
            input_nodes.append(InputNode(shape=node["shape"], to_data=to_data, name=node["name"]))
        except KeyError:
            Logger.error(f"One of node in input_nodes unable to parse, node={node}")
            raise InputNodesParseException

    output_nodes: List[OutputNode] = []
    for node in info.get("output_nodes"):
        if not isinstance(node.get("from_data", None), dict):
            Logger.error(f"One of node in output_nodes not have from_data, node={node}")
            raise OutputNodesParseException
        try:
            from_data: NodeDataPair = NodeDataPair(
                data_idx=node["from_data"]["data_idx"],
                net_node_idx=node["from_data"]["net_node_idx"]
            )
        except KeyError:
            Logger.error(f"One of node in output_nodes have an error from_data, node={node}")
            raise OutputNodesParseException

        if not isinstance(node.get("name", None), str):
            Logger.error(f"One of node in output_nodes not have name, node={node}")
            raise OutputNodesParseException

        output_nodes.append(OutputNode(from_data=from_data, name=node["name"]))

    net_nodes: List[LayerNode] = []
    for node in info.get("net_nodes"):
        from_data: List[NodeDataPair | None] = []
        if not isinstance(node.get("from_data", None), list):
            Logger.error(f"One of node in net_nodes not have from_data, node={node}")
            raise NetNodesParseException
        for data_pair in node.get("from_data"):
            if data_pair is None:
                from_data.append(None)
                continue
            if not isinstance(data_pair, dict):
                Logger.error(f"One of node in net_nodes have an error from_data, node={node}")
                raise NetNodesParseException
            try:
                from_data.append(NodeDataPair(data_idx=data_pair["data_idx"], net_node_idx=data_pair["net_node_idx"]))
            except KeyError:
                Logger.error(f"One of node in net_nodes have an error from_data, node={node}")
                raise NetNodesParseException

        if not isinstance(node.get("args", None), list):
            Logger.error(f"One of arg in net_nodes not have args, node={node}")
            raise NetNodesParseException
        args = {}
        for arg in node.get("args"):
            try:
                args[arg["key"]] = arg["value"]
            except KeyError:
                Logger.error(f"One of node in net_nodes have an error args, node={node}")
                raise NetNodesParseException

        if not isinstance(node.get("api_name", None), str):
            Logger.error(f"One of arg in net_nodes not have api_name, node={node}")
            raise NetNodesParseException

        net_nodes.append(LayerNode(api_name=node["api_name"], from_data=from_data, **args))

    return input_nodes, output_nodes, net_nodes


def _get_graph(data: str) -> Dict | JSONResponse:
    try:
        input_nodes, output_nodes, net_nodes = _parse_graph(data)
    except JSONParseException:
        return JSON_PARSE_ERROR_RESPONSE
    except JSONTypeException:
        return JSON_NOT_DICT_ERROR_RESPONSE
    except NoInputNodesException:
        return NOT_INPUT_NODES_ERROR_RESPONSE
    except NoOutputNodesException:
        return NOT_OUTPUT_NODES_ERROR_RESPONSE
    except NoNetNodesException:
        return NOT_NET_NODES_ERROR_RESPONSE
    except InputNodesParseException:
        return INPUT_NODES_PARSE_ERROR_RESPONSE
    except OutputNodesParseException:
        return OUTPUT_NODES_PARSE_ERROR_RESPONSE
    except NetNodesParseException:
        return NET_NODES_PARSE_ERROR_RESPONSE
    # except Exception as e:
    #     return get_json_response(400, f"Unexpected error: {e}")

    return {
        "input_nodes": input_nodes,
        "output_nodes": output_nodes,
        "net_nodes": net_nodes
    }


@router.post("/pytorch")
async def model_calculate(request: ModelCalculateRequest):
    Logger.debug(request)

    info = _get_graph(request.data)
    if not isinstance(info, dict):
        return info

    net_name = request.name
    if net_name is not None and net_name.isidentifier():
        net_name = None

    try:
        parser = TorchParser(**info, network_name=net_name)

        file_name = f"{parser.network_name}.py"
        save_path = os.path.join(MODEL_RESULT_PATH, file_name)

        parser.network_class(save_path)
    except Exception as e:
        return get_json_response(status_code=400, msg=f"Parser return error due to {str(e)}")

    return get_json_response(status_code=200, msg=f"Parser return successfully", fn=file_name)
