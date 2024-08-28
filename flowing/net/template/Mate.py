# Copyright © 2024 PMoS. All rights reserved.

import os

torch_tmpl_path: str
tensorflow_tmpl_path: str

__torch_module_class_tmpl_file_name: str = "TorchModuleClass.tmpl"
__tensorflow_module_class_tmpl_file_name: str = "TensorFlowModuleClass.tmpl"

# implement
__current_dir = os.path.dirname(__file__)
torch_tmpl_path = os.path.join(__current_dir, __torch_module_class_tmpl_file_name)
tensorflow_tmpl_path = os.path.join(__current_dir, __tensorflow_module_class_tmpl_file_name)

if not os.path.exists(torch_tmpl_path):
    raise FileNotFoundError(
        f"cannot find torch_tmpl in {torch_tmpl_path}"
    )
if not os.path.exists(tensorflow_tmpl_path):
    raise FileNotFoundError(
        f"cannot find tensorflow_tmpl in {tensorflow_tmpl_path}"
    )
del os, __current_dir
