# Copyright © 2024-2025 PMoS. All rights reserved.

import os

MINDSPORE_TMPL_PATH: str
TENSORFLOW_TMPL_PATH: str
TORCH_TMPL_PATH: str

LAYER_NAME_FMT = "{api_name}_{api_idx}"
LAYER_OUTPUT_NAME_FMT = "h_{api_name}_{api_idx}"
INPUT_NAME_FMT = "x_{idx}"
OUTPUT_NAME_FMT = "y_{idx}"

# implement
__mindspore_module_class_tmpl_file_name: str = "MindSporeModuleClass.tmpl"
__tensorflow_module_class_tmpl_file_name: str = "TensorFlowModuleClass.tmpl"
__torch_module_class_tmpl_file_name: str = "TorchModuleClass.tmpl"

__current_dir = os.path.dirname(__file__)
MINDSPORE_TMPL_PATH = os.path.join(__current_dir, __mindspore_module_class_tmpl_file_name)
TENSORFLOW_TMPL_PATH = os.path.join(__current_dir, __tensorflow_module_class_tmpl_file_name)
TORCH_TMPL_PATH = os.path.join(__current_dir, __torch_module_class_tmpl_file_name)

if not os.path.exists(MINDSPORE_TMPL_PATH):
    raise FileNotFoundError(
        f"cannot find tensorflow_tmpl in {MINDSPORE_TMPL_PATH}"
    )
if not os.path.exists(TENSORFLOW_TMPL_PATH):
    raise FileNotFoundError(
        f"cannot find tensorflow_tmpl in {TENSORFLOW_TMPL_PATH}"
    )
if not os.path.exists(TORCH_TMPL_PATH):
    raise FileNotFoundError(
        f"cannot find torch_tmpl in {TORCH_TMPL_PATH}"
    )
del os, __current_dir
