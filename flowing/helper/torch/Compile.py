# Copyright © 2024 PMoS. All rights reserved.

import torch
from torch import nn
from torch import _dynamo as torch_dynamo


class _TestNet(nn.Module):
    def __init__(self):
        super(_TestNet, self).__init__()
        self.f = nn.Sequential(
            nn.Linear(2, 16),
            nn.Linear(16, 32),
        )

    def forward(self, x):
        self.f(x).cat(self.f(x))
        return self.f(x)


def backend_is_available(backend: str) -> bool:
    test_net = _TestNet()
    test_input = torch.randn((1, 2))

    try:
        test_net.compile(backend=backend)
        test_net = test_net
        _ = test_net(test_input)
        if torch.cuda.is_available():
            test_input = test_input.cuda()
            test_net = test_net.cuda()
            _ = test_net(test_input)
    except RuntimeError:
        return False
    return True


def get_available_compile():
    return list(filter(backend_is_available, torch_dynamo.list_backends()))
