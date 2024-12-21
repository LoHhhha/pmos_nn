# Copyright © 2024 PMoS. All rights reserved.

import torch


class ModelPair:
    name: str
    model: torch.nn.Module

    def __init__(
            self,
            name: str,
            model: torch.nn.Module):
        self.name = name
        self.model = model

    def __repr__(self):
        return f"ModelPair(name:{self.name}, class:{self.model.__class__})"
