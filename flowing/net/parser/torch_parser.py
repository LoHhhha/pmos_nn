# Copyright © 2024-2025 PMoS. All rights reserved.

import os
import time
import autopep8
from datetime import datetime
from collections import deque
from typing import List, Tuple, Any
from case_convert import snake_case

from flowing.config import VERSION
from flowing.shower import Logger
from flowing.net.template import Mate
from flowing.net.parser import Parser
from flowing.net.abstract import LayerNode, InputNode, OutputNode
from flowing.net.layer.torch import *  # using to eval()

'''
Net definition:
    input_nodes: To confirm the items of each time forward used, and the order of it is the order of forward args.
        e.g.: input_nodes=(input_node0,input_node1) means net will be forward as net(input_node0_item, input_node1_item)
    net_nodes: To confirm the data flow of the net. Using topological sorting to generate a really class of nn.Module.
    output_nodes: To confirm the items of each time forward get.
'''

LAYER_NAME_FMT = "{api_name}_{api_idx}"
LAYER_OUTPUT_NAME_FMT = "h_{api_name}_{api_idx}"
INPUT_NAME_FMT = "x_{idx}"
OUTPUT_NAME_FMT = "y_{idx}"


class TorchParser(Parser):
    _parse_sequence_index_list: List[int]
    _forward_code_result_list: List[str] | None = None
    _init_code_result_list: List[str] | None = None

    def __init__(
            self,
            input_nodes: List[InputNode] | Tuple[InputNode, ...],
            net_nodes: List[LayerNode] | Tuple[LayerNode, ...],
            output_nodes: List[OutputNode] | Tuple[OutputNode, ...],
            network_name: str = None,
    ):
        if network_name is None:
            network_name = f"AutoTorchNet{int(time.time() * 1000)}"

        super().__init__(
            input_nodes=input_nodes,
            net_nodes=net_nodes,
            output_nodes=output_nodes,
            network_name=network_name,
        )
        self._init_layer_object()

        self._parse_sequence_index_list = self._get_parse_sequence_index_list()
        Logger.info(f"Network({self.network_name}) generated sequence parse successful.")

        self._push_all_layer_name()
        Logger.info(f"Network({self.network_name}) layer name parse successful.")

        self._forward_code_result_list = None
        self._init_code_result_list = None

    def _init_layer_object(self):
        for node in self.net_nodes:
            data_amount = len(node.from_data)
            if data_amount:
                node.layer_object = eval(node.api_name)(data_amount=data_amount, **node.layer_init_kwargs)
            else:
                node.layer_object = eval(node.api_name)(**node.layer_init_kwargs)

    def _init_code_list(self) -> List[str]:
        if self._init_code_result_list is not None:
            return self._init_code_result_list

        self._init_code_result_list = [
            code for idx in self._parse_sequence_index_list for code in self.net_nodes[idx].layer_object.init_code()
        ]

        # some op doesn't need init, so it is ok when some is None.
        # for idx in range(self.net_nodes_size):
        #     if self._init_code_result_list[idx] is None:
        #         Logger.fault(f"Network({self.network_name}) parse fail.")
        #         raise

        return list(filter(lambda x: x is not None, self._init_code_result_list))

    def _forward_code_list(self) -> List[str]:
        if self._forward_code_result_list is not None:
            return self._forward_code_result_list

        self._forward_code_result_list = [
            code for idx in self._parse_sequence_index_list for code in
            self.net_nodes[idx].layer_object.forward_code()
        ]
        self._forward_code_result_list += [node.forward_code() for node in self.output_nodes]

        return self._forward_code_result_list

    def network_class(self, save_path: str = None) -> Any:
        tmpl_file_path = Mate.torch_tmpl_path

        with open(tmpl_file_path, "r", encoding="utf-8") as f:
            class_tmpl = "".join(f.readlines())

        class_str = class_tmpl.format(
            time=datetime.now(),
            version=VERSION,
            more_information="",
            other_import="",
            net_name=self.network_name,
            init_args=self._name_list_to_args(None),
            init_code=self._code_list_to_code_segment(self._init_code_list(), retract_amount=8),
            inputs=self._name_list_to_args([node.name for node in self.input_nodes]),
            forward_code=self._code_list_to_code_segment(self._forward_code_list(), retract_amount=8),
            outputs=self._name_list_to_args([node.name for node in self.output_nodes], with_self=False)
        )

        try:
            class_str = autopep8.fix_code(
                class_str,
                options={
                    "aggressive": 2,
                    "experimental": True,
                    "pep8_passes": 20,
                }
            )
        except Exception as e:
            Logger.fault(f"Network({self.network_name}) class format as pep8 fail.")
            raise e

        try:
            Logger.debug(class_str)
            exec(class_str, globals())
        except Exception as e:
            Logger.fault(f"Network({self.network_name}) class execute fail.")
            raise e

        if save_path is not None:
            if os.path.isdir(save_path):
                Logger.fault(f"Network({self.network_name}) class file save fail.")
                raise IsADirectoryError(
                    f"save_file expected to be a file path, but it is a existed directory as {save_path}"
                )

            if os.path.exists(save_path):
                Logger.warning(f"Target path '{save_path}' already exists, it will be overwritten.")

            with open(save_path, "w", encoding="utf-8") as f:
                f.write(class_str)
        else:
            Logger.warning("Class will not be saved as a file.")

        return eval(self.network_name)

    def _get_parse_sequence_index_list(self):
        to_deg = [0 for _ in range(self.net_nodes_size)]
        next_idx_list = [[] for _ in range(self.net_nodes_size)]
        for idx in range(self.net_nodes_size):
            node = self.net_nodes[idx]
            for data in node.from_data:
                if data is None:
                    continue
                if data.net_node_idx >= self.net_nodes_size:
                    Logger.fault(f"Network({self.network_name}) sequence parse fail.")
                    raise IndexError(
                        f"from net_nodes[{idx}].from_data get an error data as {data}, "
                        f"which net_node_idx bigger than the biggest index of net_nodes({self.net_nodes_size - 1})."
                    )
                to_deg[idx] += 1
                next_idx_list[data.net_node_idx].append(idx)

        dq = deque()
        input_start_node_set = set()
        for idx in range(len(self.input_nodes)):
            node = self.input_nodes[idx]
            for data in node.to_data:
                if data.net_node_idx >= self.net_nodes_size:
                    Logger.fault(f"Network({self.network_name}) sequence parse fail.")
                    raise IndexError(
                        f"from input_nodes[{idx}].to_data get an error data as {data}, "
                        f"which net_node_idx bigger than the biggest index of net_nodes({self.net_nodes_size - 1})."
                    )

                if to_deg[data.net_node_idx] == 0:
                    input_start_node_set.add(data.net_node_idx)

        for idx in input_start_node_set:
            dq.append(idx)

        dead_nodes = []
        for idx in range(self.net_nodes_size):
            if to_deg[idx] == 0 and idx not in input_start_node_set:
                # if from_data is zero, it maybe a 'data' node
                # else it maybe a dead_nodes which means that not any node points to it.
                if len(self.net_nodes[idx].from_data) == 0:
                    dq.append(idx)
                else:
                    dead_nodes.append(idx)
        if len(dead_nodes) != 0:
            Logger.fault(f"Network({self.network_name}) sequence parse fail.")
            raise ValueError(
                f"find this node of the network {dead_nodes} is not had any input_node point to or not a 'data' node, "
                f"can not finish the parse."
            )

        parse_sequence_index_list = []
        while len(dq) != 0:
            idx = dq.popleft()
            parse_sequence_index_list.append(idx)

            for next_idx in list(next_idx_list[idx]):
                to_deg[next_idx] -= 1
                if to_deg[next_idx] == 0:
                    dq.append(next_idx)

        parse_sequence_index_set = set(parse_sequence_index_list)
        for idx in range(len(self.output_nodes)):
            node = self.output_nodes[idx]
            if node.from_data is None:
                continue
            if node.from_data.net_node_idx >= self.net_nodes_size:
                Logger.fault(f"Network({self.network_name}) sequence parse fail.")
                raise IndexError(
                    f"from output_nodes[{idx}].to_data get an error data as {node.from_data}, "
                    f"which net_node_idx bigger than the biggest index of net_nodes({self.net_nodes_size - 1})."
                )
            if node.from_data.net_node_idx not in parse_sequence_index_set:
                Logger.fault(f"Network({self.network_name}) sequence parse fail.")
                raise ValueError(
                    f"output_nodes[{idx}] need net_nodes[{node.from_data.net_node_idx}], "
                    f"but we only get one order as {parse_sequence_index_list} after topological sorting."
                )

        if len(parse_sequence_index_list) != self.net_nodes_size:
            Logger.warning(
                "when parsing network, we found some loop in the network and the nodes were "
                f"{[idx for idx in range(self.net_nodes_size) if idx not in parse_sequence_index_set]}, "
                "but it didn't influence the coming parsing."
            )

        return parse_sequence_index_list

    def _push_all_layer_name(self):
        # push OutputNode name
        for idx in range(self.input_nodes_size):
            node = self.input_nodes[idx]
            if node.name is ...:
                node.name = INPUT_NAME_FMT.format(idx=idx)

        # push name to the beginning node
        for idx in range(self.input_nodes_size):
            node = self.input_nodes[idx]
            for data in node.to_data:
                # this check finished in __get_parse_sequence_index_list()
                # if data.net_node_idx >= net_nodes_size:
                #     raise

                to_layer_node = self.net_nodes[data.net_node_idx]
                if data.data_idx >= to_layer_node.layer_object.data_amount:
                    Logger.fault(f"Network({self.network_name}) push names fail.")
                    raise IndexError(
                        f"from input_nodes[{idx}].to_data get an error data as {data}, "
                        f"which data_idx bigger than the biggest index of net_nodes[{data.net_node_idx}]'s data_names"
                        f"({to_layer_node.layer_object.data_amount - 1})."
                    )
                if to_layer_node.layer_object.data_names[data.data_idx] is not None:
                    Logger.fault(f"Network({self.network_name}) push names fail.")
                    raise IndexError(
                        f"net_nodes[{data.net_node_idx}]'s data_names[{data.data_idx}] is not None, means that it has "
                        f"been assigned before as {to_layer_node.layer_object.data_names[data.data_idx]}"
                    )
                to_layer_node.layer_object.data_names[data.data_idx] = self.input_nodes[idx].name

        # impossible, only need to check if some datas in the same data_names place
        # for data_name in self.net_nodes[self.parse_sequence_index_list[0]].layer_object.data_names:
        #     if data_name is None:
        #         raise

        api_counter = dict()
        for idx in self._parse_sequence_index_list:
            node = self.net_nodes[idx]
            api_idx = api_counter.get(node.api_name, 0)
            api_counter[node.api_name] = api_idx + 1
            node.layer_object.layer_name = LAYER_NAME_FMT.format(api_name=snake_case(node.api_name), api_idx=api_idx)
            node.layer_object.output_name = LAYER_OUTPUT_NAME_FMT.format(
                api_name=snake_case(node.api_name),
                api_idx=api_idx
            )
            for data_ptr in range(len(node.from_data)):
                data = node.from_data[data_ptr]
                # if it was None, it came from input.
                if data is None:
                    if node.layer_object.data_names[data_ptr] is None:
                        Logger.fault(f"Network({self.network_name}) push names fail.")
                        raise IndexError(
                            f"net_nodes[{idx}]'s data_names[{data_ptr}] is None, means that it have not "
                            f"been assigned before."
                        )
                    continue

                # not need to check idx < self.net_nodes_size

                from_node = self.net_nodes[data.net_node_idx]
                if data.data_idx >= from_node.layer_object.output_amount:
                    Logger.fault(f"Network({self.network_name}) push names fail.")
                    raise IndexError(
                        f"from net_nodes[{idx}].from_data get an error data as {data}, "
                        f"which data_idx bigger than the biggest index of net_nodes[{data.net_node_idx}]'s output_name"
                        f"({from_node.layer_object.data_amount - 1})."
                    )

                if from_node.layer_object.output_amount == 1:
                    node.layer_object.data_names[data_ptr] = from_node.layer_object.output_name
                else:
                    node.layer_object.data_names[data_ptr] = f"{from_node.layer_object.output_name}[{data.data_idx}]"

        # push OutputNode name
        for idx in range(self.output_nodes_size):
            node = self.output_nodes[idx]
            data = node.from_data

            node.name = OUTPUT_NAME_FMT.format(idx=idx) if node.name is ... else node.name

            # not need to check idx < self.net_nodes_size

            from_node = self.net_nodes[data.net_node_idx]
            if data.data_idx >= self.net_nodes[data.net_node_idx].layer_object.output_amount:
                Logger.fault(f"Network({self.network_name}) push names fail.")
                raise IndexError(
                    f"from output_nodes[{idx}].from_data get an error data as {data}, "
                    f"which data_idx bigger than the biggest index of net_nodes[{data.net_node_idx}]'s output_name"
                    f"({from_node.layer_object.data_amount - 1})."
                )

            if from_node.layer_object.output_amount == 1:
                node.data_name = from_node.layer_object.output_name
            else:
                node.data_name = f"{from_node.layer_object.output_name}[{data.data_idx}]"
