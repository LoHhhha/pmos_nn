from flowing.config.Mate import *

ReadyDependencies = {
    "mindspore": False,
    "tensorflow": False,
    "torch": False,
}

# check dependency
import importlib
import warnings

for name in ReadyDependencies.keys():
    try:
        importlib.import_module(name)
        ReadyDependencies[name] = True
    except ImportError:
        warnings.warn(f"package {name} not found, features is limited.")

del importlib
del warnings
