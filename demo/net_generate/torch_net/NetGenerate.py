# Copyright © 2024 PMoS. All rights reserved.

import torch

from flowing.net.parser import TorchParser
from demo.net_generate.NetInformation import get_e2e_net_info, get_m2m_net_info


def e2e_net():
    parser = TorchParser(**get_e2e_net_info(is_mindspore=False), network_name="DNet")

    net = parser.network_class(save_path="./E2ENet.py")()

    # test forward
    net(torch.rand(1, 3, 128, 256))


def m2m_net():
    parser = TorchParser(**get_m2m_net_info(is_mindspore=False), network_name="MNet")

    net = parser.network_class(save_path="./M2MNet.py")()

    # test forward
    net(torch.rand(1, 3, 128, 256), torch.rand(1, 3, 128, 256))


if __name__ == "__main__":
    e2e_net()
    m2m_net()
