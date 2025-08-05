# Copyright © 2024 PMoS. All rights reserved.

import torch.utils

beta = 0.95


def get_new_rate(start_learning_rate: float, epoch: int, start: int = 0) -> float:
    return (beta ** max(epoch - start, 0)) * start_learning_rate


def set_new_rate_by_now(optimizer: torch.optim.Optimizer):
    set_rate(learning_rate=get_rate(optimizer=optimizer) * beta, optimizer=optimizer)


def set_rate(learning_rate: float, optimizer: torch.optim.Optimizer) -> None:
    for param_group in optimizer.param_groups:
        param_group['lr'] = learning_rate


def get_rate(optimizer: torch.optim.Optimizer):
    for param_group in optimizer.param_groups:
        return param_group['lr']
    return -1
