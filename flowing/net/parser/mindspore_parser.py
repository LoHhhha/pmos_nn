# Copyright © 2025 PMoS. All rights reserved.

import time
import importlib
from typing import List, Tuple

from flowing.net.template import Mate
from flowing.net.parser import Parser
from flowing.net.abstract import LayerNode, InputNode, OutputNode
import flowing.net.layer.mindspore as mindspore_layers

MINDSPORE_OK = False
try:
    importlib.import_module("mindspore")
    MINDSPORE_OK = True
except ImportError:
    pass


class MindSporeParser(Parser):
    def __init__(
            self,
            input_nodes: List[InputNode] | Tuple[InputNode, ...],
            net_nodes: List[LayerNode] | Tuple[LayerNode, ...],
            output_nodes: List[OutputNode] | Tuple[OutputNode, ...],
            network_name: str = None,
    ):
        if network_name is None:
            network_name = f"AutoMindSporeNet{int(time.time() * 1000)}"

        super().__init__(
            input_nodes=input_nodes,
            net_nodes=net_nodes,
            output_nodes=output_nodes,
            dependencies_ready=MINDSPORE_OK,
            layers_package=mindspore_layers,
            network_template_path=Mate.MINDSPORE_TMPL_PATH,
            network_name=network_name,
        )
