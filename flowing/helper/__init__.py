import importlib

try:
    importlib.import_module("mindspore")
    from flowing.helper import mindspore
except ImportError:
    pass

try:
    importlib.import_module("tensorflow")
    from flowing.helper import tensorflow
except ImportError:
    pass

try:
    importlib.import_module("torch")
    from flowing.helper import torch
except ImportError:
    pass

del importlib
