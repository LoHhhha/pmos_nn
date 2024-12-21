# Copyright © 2024 PMoS. All rights reserved.

class JSONParseException(Exception):
    pass


class JSONTypeException(Exception):
    pass


class NoInputNodesException(Exception):
    pass


class NoOutputNodesException(Exception):
    pass


class NoNetNodesException(Exception):
    pass


class InputNodesParseException(Exception):
    pass


class OutputNodesParseException(Exception):
    pass


class NetNodesParseException(Exception):
    pass
