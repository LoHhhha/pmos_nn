# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Any


class ModelPair:
    name: str
    model: Any

    def __init__(self, name: str, model: Any):
        self.name = name
        self.model = model

    def __repr__(self):
        return f"ModelPair(name:{self.name}, class:{self.model.__class__})"
