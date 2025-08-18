# Copyright © 2025 PMoS. All rights reserved.

import mindspore

from flowing.net.parser import MindSporeParser
from demo.net_generate.NetInformation import get_e2e_net_info, get_m2m_net_info


def e2e_net():
    parser = MindSporeParser(**get_e2e_net_info(is_mindspore=True), network_name="DNet")

    net = parser.network_class(save_path="./E2ENet.py")()

    # test forward
    net(mindspore.ops.rand(1, 3, 128, 256))


def m2m_net():
    parser = MindSporeParser(**get_m2m_net_info(is_mindspore=True), network_name="MNet")

    net = parser.network_class(save_path="./M2MNet.py")()

    # test forward
    net(mindspore.ops.rand(1, 3, 128, 256), mindspore.ops.rand(1, 3, 128, 256))


if __name__ == "__main__":
    e2e_net()
    m2m_net()
