# Copyright © 2025 PMoS. All rights reserved.

from flowing.net.layer.mindspore.activation.common import _AlphaActivation

__all__ = [
    "CELU",
    "ELU",
    "LeakyReLU",
]


class CELU(_AlphaActivation):
    _api_name = "CELU"

    def __init__(self, alpha: float = 1.0, **kwargs):
        super().__init__(**kwargs)

        self.alpha = alpha


class ELU(CELU):
    _api_name = "ELU"

    def content_check(self):
        # mindspore now only support alpha=1.0
        if abs(self.alpha - 1.0) > 1e-8:
            raise ValueError(
                f"detect an unexpected alpha as {self.alpha}, "
                f"expected alpha=1.0"
            )


class LeakyReLU(_AlphaActivation):
    _api_name = "LeakyReLU"

    def __init__(self, alpha: float = 0.2, **kwargs):
        super().__init__(**kwargs)

        self.alpha = alpha
