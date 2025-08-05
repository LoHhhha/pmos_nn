# Copyright © 2024-2025 PMoS. All rights reserved.

from typing import Any


class LossPair:
    model_idx: int
    loss: Any

    def __init__(self, model_idx: int, loss: Any = None):
        self.model_idx = model_idx
        self.loss = loss

    def __repr__(self):
        return f"LossPair(model_idx:{self.model_idx}, loss:{self.loss.item():.2f})"
