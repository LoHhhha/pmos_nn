# Copyright © 2024 PMoS. All rights reserved.

import json
import traceback

from fastapi import APIRouter

from flowing.server.common import info_to_layer_node, get_json_response
from flowing.shower import Logger
from flowing.server.response import JSON_PARSE_ERROR_RESPONSE, NOT_IMPLEMENTED_ERROR_RESPONSE, \
    JSON_NOT_DICT_ERROR_RESPONSE
from flowing.server.shape.calculate.models import ShapeCalculateRequest, NET_NODE_INFOS_PARSE_ERROR_RESPONSE
import flowing.net.layer.torch as torch_layers
import flowing.net.layer.mindspore as mindspore_layers

router = APIRouter(
    prefix="/calculate",
    tags=["calculate"],
)


def shape_calculate(request: ShapeCalculateRequest, layers):
    """
        /shape/calculate/*:
        - input:
            ShapeCalculateRequest(
                timestamp<int>,
                data<str(json)>:{
                    net_node_infos<list>:[{
                        node: ...,  # like /model/calculate/pytorch
                        shape<list>:[
                            shape<tuple>:(<int>,...)
                        ],
                    }]
                },
                name<str>
            )
        - output:
            net_nodes_shape<list>:[
                shape<list>:[
                    shape<tuple>|None:(<int>,...)   # when fail to calculate shape, it will be None!
                ],
            ]
            net_nodes_msg<list>:[
                msg<str>|None    # when fail to calculate shape,
                                    it will be the reason why calculation failed else it will be None!
            ]
    """

    try:
        info = json.loads(request.data)
    except json.JSONDecodeError as e:
        Logger.error(f"JSON parse fail due to:{e}, data={request.data}")
        return JSON_PARSE_ERROR_RESPONSE
    except Exception as e:
        Logger.error(f"unexpected error:{e}, data={request.data}")
        return get_json_response(400, f"Unexpected error:{e}")

    if not isinstance(info, dict):
        Logger.error(f"Info type is {type(info)} expected dict")
        return JSON_NOT_DICT_ERROR_RESPONSE

    net_node_infos = info.get("net_node_infos", None)
    if net_node_infos is None:
        Logger.warning(f"Get None net_node_infos.")
        net_node_infos = []
    elif not isinstance(net_node_infos, list):
        Logger.error(f"net_node_infos type is {type(net_node_infos)}, expected list")
        return NET_NODE_INFOS_PARSE_ERROR_RESPONSE

    net_nodes_shape = []
    net_nodes_msg = []
    try:
        for info in net_node_infos:  # may raise TypeError
            node = info.get("node", None)
            if not isinstance(node, dict):
                raise ValueError(
                    f"Node type is {type(node)} expected dict"
                )

            shape = info.get("shape", None)
            if not isinstance(shape, list):
                raise ValueError(
                    f"Shape type is {type(shape)} expected list"
                )

            layer_node = info_to_layer_node(node)  # may raise ValueError

            try:
                data_amount = len(layer_node.from_data)
                # may raise ClassNotFound or ValueError
                layer_node.layer_object = getattr(layers, layer_node.api_name)(
                    data_amount=data_amount,
                    **layer_node.layer_init_kwargs
                )

                net_nodes_shape.append(layer_node.layer_object.output_shape(*shape))  # may raise ValueError
                net_nodes_msg.append(None)
            except ValueError as e:
                Logger.warning(f"{info} shape calculate fail due to {e}")
                net_nodes_shape.append(None)
                net_nodes_msg.append(str(e))
    except TypeError as e:
        Logger.error(f"net_node_infos unexpected due to:{e}, {net_node_infos}")
        return NET_NODE_INFOS_PARSE_ERROR_RESPONSE
    except ValueError as e:
        Logger.error(f"net_node_infos get shapes fail due to:{e}, {net_node_infos}")
        return NET_NODE_INFOS_PARSE_ERROR_RESPONSE
    except Exception as e:
        traceback.print_exc()
        Logger.error(f"net_node_infos trigger a unexpected error {e}, {net_node_infos}")
        return NET_NODE_INFOS_PARSE_ERROR_RESPONSE

    return get_json_response(status_code=200, net_nodes_shape=net_nodes_shape, net_nodes_msg=net_nodes_msg)


@router.post("/pytorch")
async def shape_calculate_pytorch(request: ShapeCalculateRequest):
    Logger.debug(request)

    return shape_calculate(request, torch_layers)


@router.post("/mindspore")
async def model_calculate_mindspore(request: ShapeCalculateRequest):
    Logger.debug(request)

    return shape_calculate(request, mindspore_layers)


@router.post("/tensorflow")
async def model_calculate_tensorflow(request: ShapeCalculateRequest):
    Logger.debug(request)

    return NOT_IMPLEMENTED_ERROR_RESPONSE
