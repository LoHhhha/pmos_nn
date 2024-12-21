# Copyright © 2024 PMoS. All rights reserved.

from enum import Enum


class ActionCode(Enum):
    # ADD_DATA: add data to data_buffer
    # ADD_DATA <Data>
    # Not None:
    #   - data
    # E.g.: "ADD_DATA torch.zeros(1)" means adding an torch.zeros(1) to data_buffer.
    ADD_DATA = 0

    # FORWARD: let model to forward by the following params and push to data_buffer
    # FORWARD <ModelIndex> [<DataIdx>, ...]
    # Not None:
    #   - model_idx
    #   - data_idx_list
    # E.g.: "FORWARD 0 [12, 1]" means let model0 to forward by using data12 and data1, if data is out of index \\
    #       dataLoader given it means to use the data added from others. Finally, push the data to data_buffer.
    FORWARD = 1

    # CRITERION: using a loss function to evaluate a model in a given weight and add to loss_buffer
    # CRITERION <LossFunctionIndex> <ModelIndex> <DataIdx> <DataIdx> <Weight>
    # Not None:
    #   - loss_func_idx
    #   - weight
    #   - model_idx
    #   - data_idx_list
    # E.g.: "CRITERION 0 1 2 3 0.2" means using lossFunction 0 in data2, data3 to evaluate model1, and this loss will \\
    #       be multiplied weight. (1, 0.2*loss) will be pushed to loss_buffer.
    CRITERION = 2

    # BACKWARD: model backward op
    # BACKWARD <ModelIndex>
    # Not None:
    #   - model_idx
    # E.g.: "BACKWARD 0" means model0 backward. this will first add all loss belong to model0 and push \\
    #       "{model_name}_loss:loss" to information_buffer, then backward.
    BACKWARD = 3

    # CLEAR_GRADIENT: clear optimizes gradient.
    # CLEAR_GRADIENT [<optimizer0>, ...]
    # Not None:
    #   -
    # E.g.: "CLEAR_GRADIENT" means all optimizers will execute optimizer.zero_grad()
    #       "CLEAR_GRADIENT [1, 3]" means optimizer1 and optimizer3 will execute optimizer.zero_grad()
    CLEAR_GRADIENT = 4

    # OPT_STEP
    # OPT_STEP [<optimizer0>, ...]
    # Not None:
    #   -
    # E.g.: "OPT_STEP" means all optimizers will execute optimizer.step()
    #       "OPT_STEP [1, 3]" means optimizer1 and optimizer3 will execute optimizer.step()
    OPT_STEP = 5

    # GET_INFO: get information from data through a giving function, then push or plus the info to \\
    #           information_buffer<dict>.
    # GET_INFO <CalculateFunction> [<DataIdx>, ...]
    # function: (*data) -> dict
    # Not None:
    #   - calculate_function/calculate_object(__call__) which return a dict or can be **XXX.
    #   -
    # E.g.: "GET_INFO IoU 1 2" means using IoU to calculate some information from data1 and data2.
    GET_INFO = 6

    # GET_DATA: using some function(output) or callable object(get for using) to save or display the data, then push \\
    #           the data function returned if exists.
    # function: (data_times: int, *data) -> None | Any
    #       data_times: the times of data get from dataloader in one epoch.
    # GET_DATA <ReadFunction> [<DataIdx>, ...]
    # Not None:
    #   - read_function/read_object(__call__)
    #   -
    # E.g.: "GET_DATA show 1 2" means using show to output some things of data1 and data2.
    GET_DATA = 7
