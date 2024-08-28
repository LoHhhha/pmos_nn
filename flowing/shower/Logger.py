# Copyright © 2024 PMoS. All rights reserved.

import os
import inspect
from datetime import datetime

INFO_MSG = 0
WARNING_MSG = 1
ERROR_MSG = 2
FAULT_MSG = 3

MSG_TYPES_STR = [
    "\033[1m\033[32mInfo\033[0m",
    "\033[1m\033[33mWarning\033[0m",
    "\033[1m\033[35mError\033[0m",
    "\033[1m\033[31mFault\033[0m",
]


def info(*msg):
    __print_out(INFO_MSG, *msg)


def warning(*msg):
    __print_out(WARNING_MSG, *msg)


def error(*msg):
    __print_out(ERROR_MSG, *msg)


def fault(*msg):
    __print_out(FAULT_MSG, *msg)


def __print_out(msg_type: int, *msg) -> None:
    # inspect.stack()[1] is info/warning/error
    caller_frame = inspect.stack()[2]
    try:
        caller_file = os.path.basename(caller_frame[1]).split('.')[0]
        caller_line = caller_frame[2]
    except IndexError:
        caller_file = "Unknown"
        caller_line = "None"

    print(f'[{MSG_TYPES_STR[msg_type]}|{datetime.now()}|{caller_file}:{caller_line}]', *msg)

    # todo: log save


if __name__ == '__main__':
    info("info msg")
    warning("warning msg")
    error("error msg")
    fault("fault msg")
