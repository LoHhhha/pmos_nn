from flowing.config.Mate import *

# check dependency
import importlib
import warnings

for name in ["mindspore", "tensorflow", "torch"]:
    try:
        importlib.import_module(name)
    except ImportError:
        warnings.warn(f"package {name} not found, features is limited.")

del importlib
del warnings
