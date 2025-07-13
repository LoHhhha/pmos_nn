# Copyright © 2024 PMoS. All rights reserved.

import json
import os.path

from typing import List, Dict

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from flowing.shower import Logger
from flowing.server.config import MODEL_RESULT_PATH
from flowing.net.abstract import InputNode, OutputNode, LayerNode
from flowing.net.parser import TorchParser
from flowing.net.struct import NodeDataPair
from flowing.server.common import get_json_response, info_to_input_node, info_to_output_node, info_to_layer_node
from flowing.server.response import JSON_PARSE_ERROR_RESPONSE, NOT_IMPLEMENTED_ERROR_RESPONSE, \
    JSON_NOT_DICT_ERROR_RESPONSE
from flowing.server.expection import JSONParseException, JSONTypeException, NoInputNodesException, \
    NoOutputNodesException, NoNetNodesException, InputNodesParseException, OutputNodesParseException, \
    NetNodesParseException
from flowing.server.model.calculate.models import ModelCalculateRequest, NOT_INPUT_NODES_ERROR_RESPONSE, \
    NOT_OUTPUT_NODES_ERROR_RESPONSE, NOT_NET_NODES_ERROR_RESPONSE, INPUT_NODES_PARSE_ERROR_RESPONSE, \
    OUTPUT_NODES_PARSE_ERROR_RESPONSE, NET_NODES_PARSE_ERROR_RESPONSE

router = APIRouter(
    prefix="/calculate",
    tags=["calculate"],
)


def _parse_graph_pytorch(data: str) -> (List[InputNode], List[OutputNode], List[NodeDataPair]):
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
        try:
            input_node = info_to_input_node(node)
        except ValueError as e:
            Logger.error(f"input_node parse fail due to:{e}")
            raise InputNodesParseException
        input_nodes.append(input_node)

    output_nodes: List[OutputNode] = []
    for node in info.get("output_nodes"):
        try:
            output_node = info_to_output_node(node)
        except ValueError as e:
            Logger.error(f"output_node parse fail due to:{e}")
            raise OutputNodesParseException
        output_nodes.append(output_node)

    net_nodes: List[LayerNode] = []
    for node in info.get("net_nodes"):
        try:
            layer_node = info_to_layer_node(node)
        except ValueError as e:
            Logger.error(f"net_node parse fail due to:{e}")
            raise OutputNodesParseException
        net_nodes.append(layer_node)

    return input_nodes, output_nodes, net_nodes


def _get_graph_pytorch(data: str) -> Dict | JSONResponse:
    try:
        input_nodes, output_nodes, net_nodes = _parse_graph_pytorch(data)
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
async def model_calculate_pytorch(request: ModelCalculateRequest):
    Logger.debug(request)

    """
    /model/calculate/pytorch:
        - input:
            ModelCalculateRequest(
                timestamp<int>,
                data<str(json)>:{
                    net_nodes<list>:[{
                        api_name<str>,
                        from_data<list>:[{
                            net_node_idx<int>,
                            data_idx<int>
                        }],
                        args<list>:[{
                            key<str>,
                            value<Any>
                        }]
                    }],
                    input_nodes<list>:[{
                        shape<tuple>:(<int>,...),
                        to_data<list>:[{
                            net_node_idx<int>,
                            data_idx<int>
                        }],
                        name<str>
                    }],
                    output_nodes<list>:[{
                        from_data<dict>:{
                            net_node_idx<int>,
                            data_idx<int>
                        },
                        name<str>
                    }]
                },
                name<str>
            )
        - output:
            fn<str>
    """

    info = _get_graph_pytorch(request.data)
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


@router.post("/tensorflow")
async def model_calculate_tensorflow(request: ModelCalculateRequest):
    Logger.debug(request)

    return NOT_IMPLEMENTED_ERROR_RESPONSE
