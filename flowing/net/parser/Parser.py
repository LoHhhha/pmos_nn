# Copyright © 2024 PMoS. All rights reserved.

from abc import ABC, abstractmethod
from typing import List, Tuple, Any

from flowing.shower import Logger
from flowing.net.abstract import InputNode, LayerNode, OutputNode


class Parser(ABC):
    network_name: str

    input_nodes: List[InputNode] | Tuple[InputNode, ...]
    net_nodes: List[LayerNode] | Tuple[LayerNode, ...]
    output_nodes: List[OutputNode] | Tuple[OutputNode, ...]
    input_nodes_size: int
    net_nodes: int
    output_nodes_size: int

    # call the super().__init__ to assign vars.
    def __init__(
            self,
            input_nodes: List[InputNode] | Tuple[InputNode, ...],
            net_nodes: List[LayerNode] | Tuple[LayerNode, ...],
            output_nodes: List[OutputNode] | Tuple[OutputNode, ...],
            network_name: str,
    ):
        self.network_name = network_name

        if len(input_nodes) == 0:
            Logger.fault(f"Network({self.network_name}) parse fail.")
            raise ValueError(
                "input_nodes cannot be empty."
            )
        if len(net_nodes) == 0:
            Logger.fault(f"Network({self.network_name}) parse fail.")
            raise ValueError(
                "net_nodes cannot be empty."
            )
        if len(output_nodes) == 0:
            Logger.fault(f"Network({self.network_name}) parse fail.")
            raise ValueError(
                "output_nodes cannot be empty."
            )

        self.input_nodes = input_nodes
        self.net_nodes = net_nodes
        self.output_nodes = output_nodes

        self.input_nodes_size, self.net_nodes_size, self.output_nodes_size = \
            len(input_nodes), len(net_nodes), len(output_nodes)

    @abstractmethod
    # remember to call this in __init__, and this function needs to initialize the net_nodes[...].layer_object.
    # why push this to Parser? it is because we can only know how to initialize layer_object when we enter one Parser.
    def _init_layer_object(self):
        ...

    @abstractmethod
    def network_class(self, save_path: str = None) -> Any:
        ...

    @staticmethod
    def _name_list_to_args(name_list: List[str] | None, with_self: bool = True) -> str:
        if name_list is None or len(name_list) == 0:
            return "self" if with_self else ""
        return ("self, " if with_self else "") + ", ".join(name_list)

    @staticmethod
    def _code_list_to_code_segment(code_list: List[str] | None, retract_amount: int = 0) -> str:
        if code_list is None or len(code_list) == 0:
            return " " * retract_amount + "pass"
        return ("\n" + " " * retract_amount).join(code_list)
