# Copyright © 2025 PMoS. All rights reserved.

from typing import Optional


class Dtype:
    dtype: Optional[str]

    def __init__(self, dtype: Optional[str]):
        self.dtype = dtype

    def __repr__(self):
        if self.dtype is None:
            return "None"
        return f"mindspore.{self.dtype}"

    def __str__(self):
        return self.__repr__()

    def __eq__(self, other):
        return repr(self) == repr(other)
