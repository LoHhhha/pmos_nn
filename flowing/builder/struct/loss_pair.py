# Copyright © 2024 PMoS. All rights reserved.

import torch


class LossPair:
    model_idx: int
    loss: torch.Tensor

    def __init__(self, model_idx: int, loss: torch.Tensor = None):
        self.model_idx = model_idx
        self.loss = loss

    def __repr__(self):
        return f"LossPair(model_idx:{self.model_idx}, loss:{self.loss.item():.2f})"
