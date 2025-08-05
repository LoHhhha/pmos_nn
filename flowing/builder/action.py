# Copyright © 2024 PMoS. All rights reserved.

from typing import List, Callable

from flowing.builder import ActionCode
from flowing.builder.struct import LossPair
from flowing.shower import Logger

'''
attention:
    - data_idx/data_idx_list: the index of the data in args.data_buffer.
    - loss_func_idx: the index of the loss in args.criteria
    - model_idx: the index of the model in args.models
    - optimizer_idx: the index of the optimizer in args.optimizers
'''


class Action:
    action_type: ActionCode = None
    data: any = None
    model_idx: int = None
    data_idx_list: List[int] = None
    loss_func_idx: int = None
    optimizer_idx_list: List[int] = None
    weight: float = None
    calculate_function: Callable = None
    read_function: Callable = None

    def __init__(self,
                 action_type: ActionCode = None,
                 data: any = None,
                 model_idx: int = None,
                 data_idx_list: List[int] = None,
                 loss_func_idx: int = None,
                 optimizer_idx_list: List[int] = None,
                 weight: float = None,
                 calculate_function: Callable = None,
                 read_function: Callable = None):
        if action_type is None:
            raise ValueError('Action: action_type must be provided')

        if action_type == ActionCode.ADD_DATA:
            if data is None:
                raise ValueError('Action: data must be provided, when action_type=ADD_DATA')
            self.data = data
        elif action_type == ActionCode.FORWARD:
            if model_idx is None:
                raise ValueError('Action: model_idx must be provided, when action_type=FORWARD')
            if data_idx_list is None:
                raise ValueError('Action: data_idx_list must be provided, when action_type=FORWARD')
            self.model_idx = model_idx
            self.data_idx_list = data_idx_list
        elif action_type == ActionCode.CRITERION:
            if loss_func_idx is None:
                raise ValueError('Action: loss_func_idx must be provided, when action_type=CRITERION')
            if weight is None:
                raise ValueError('Action: weight must be provided, when action_type=CRITERION')
            if model_idx is None:
                raise ValueError('Action: model_idx must be provided, when action_type=CRITERION')
            if data_idx_list is None:
                raise ValueError('Action: data_idx_list must be provided, when action_type=CRITERION')
            self.loss_func_idx = loss_func_idx
            self.weight = weight
            self.model_idx = model_idx
            self.data_idx_list = data_idx_list
        elif action_type == ActionCode.BACKWARD:
            if model_idx is None:
                raise ValueError('Action: model_idx must be provided, when action_type=CRITERION')
            self.model_idx = model_idx
        elif action_type == ActionCode.CLEAR_GRADIENT:
            self.optimizer_idx_list = optimizer_idx_list
        elif action_type == ActionCode.OPT_STEP:
            self.optimizer_idx_list = optimizer_idx_list
        elif action_type == ActionCode.GET_INFO:
            if calculate_function is None:
                raise ValueError('Action: calculate_function must be provided, when action_type=GET_INFO')
            self.calculate_function = calculate_function
            if data_idx_list is None:
                self.data_idx_list = []
            else:
                self.data_idx_list = data_idx_list
        elif action_type == ActionCode.GET_DATA:
            if read_function is None:
                raise ValueError('Action: read_function must be provided, when action_type=GET_DATA')
            self.read_function = read_function
            if data_idx_list is None:
                self.data_idx_list = []
            else:
                self.data_idx_list = data_idx_list
        else:
            raise ValueError(f'action_type {action_type} is not supported')
        self.action_type = action_type

    def __call__(self, args, data_times: int, print_detail: bool = False):
        if print_detail:
            Logger.info(f"{args} calling {self}.")

        if self.action_type == ActionCode.ADD_DATA:
            args.data_buffer.append(self.data)
        elif self.action_type == ActionCode.FORWARD:
            predict = args.models[self.model_idx].model(
                *(args.data_buffer[idx].detach() for idx in self.data_idx_list)
            )
            # the output of a model maybe not only one.
            if isinstance(predict, tuple):
                args.data_buffer.extend(predict)
            else:
                args.data_buffer.append(predict)
        elif self.action_type == ActionCode.CRITERION:
            args.loss_buffer.append(LossPair(
                self.model_idx,
                args.criteria[self.loss_func_idx](
                    *(args.data_buffer[idx] for idx in self.data_idx_list)
                ) * self.weight
            ))
        elif self.action_type == ActionCode.BACKWARD:
            loss = None
            for loss_pair in args.loss_buffer:
                if loss_pair.model_idx == self.model_idx:
                    if loss is None:
                        loss = loss_pair.loss
                    else:
                        loss += loss_pair.loss
            args.loss_buffer = list(filter(lambda _pair: _pair.model_idx != self.model_idx, args.loss_buffer))
            if loss is not None:
                loss.backward()
            args.update_loss_information(loss_item=loss.item(), model_idx=self.model_idx)
        elif self.action_type == ActionCode.CLEAR_GRADIENT:
            if self.optimizer_idx_list is None:
                for opt in args.optimizers:
                    opt.zero_gard()
            else:
                for idx in self.optimizer_idx_list:
                    args.optimizers[idx].zero_grad()
        elif self.action_type == ActionCode.OPT_STEP:
            if self.optimizer_idx_list is None:
                for opt in args.optimizers:
                    opt.step()
            else:
                for idx in self.optimizer_idx_list:
                    args.optimizers[idx].step()
        elif self.action_type == ActionCode.GET_INFO:
            info = self.calculate_function(
                *(args.data_buffer[idx] for idx in self.data_idx_list)
            )
            args.information_buffer.update(**info)
        elif self.action_type == ActionCode.GET_DATA:
            ret = self.read_function(
                data_times,
                *(args.data_buffer[idx] for idx in self.data_idx_list)
            )
            if ret is not None:
                args.data_buffer.append(ret)
        else:
            raise ValueError(f'action_type {self.action_type} is not supported')

    def __repr__(self):
        return (f"Action(action_type:{self.action_type}" +
                ("".join((
                    f", data:{self.data}" if self.data is not None else "",
                    f", model_idx:{self.model_idx}" if self.model_idx is not None else "",
                    f", data_idx_list:{self.data_idx_list}" if self.data_idx_list is not None else "",
                    f", loss_func_idx:{self.loss_func_idx}" if self.loss_func_idx is not None else "",
                    f", optimizer_idx_list:{self.optimizer_idx_list}" if self.optimizer_idx_list is not None else "",
                    f", weight:{self.weight}," if self.weight is not None else "",
                    f", calculate_function:{self.calculate_function}" if self.calculate_function is not None else "",
                    f", read_function:{self.read_function}" if self.read_function is not None else ""
                ))) + ")")
