# Copyright © 2024 PMoS. All rights reserved.

import os

PUBLIC_PATH: str = os.path.join(os.path.dirname(__file__), "public")
STATIC_PATH: str = os.path.join(os.path.dirname(__file__), "static")

MODEL_RESULT_PATH: str = os.path.join(STATIC_PATH, "result")

os.makedirs(STATIC_PATH, exist_ok=True)
os.makedirs(MODEL_RESULT_PATH, exist_ok=True)
