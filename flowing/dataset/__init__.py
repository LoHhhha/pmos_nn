import importlib

try:
    importlib.import_module("mindspore")
    from flowing.dataset import mindspore
except ImportError:
    pass

try:
    importlib.import_module("tensorflow")
    from flowing.dataset import tensorflow
except ImportError:
    pass

try:
    importlib.import_module("torch")
    from flowing.dataset import torch
except ImportError:
    pass

del importlib
