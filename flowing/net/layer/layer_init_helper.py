# Copyright © 2025 PMoS. All rights reserved.

import importlib
from typing import Dict, Any


class LayerInitHelper:
    package_cache: Dict[str, Any]

    @classmethod
    def __get_package(cls, package_name: str):
        if not hasattr(cls, "package_cache"):
            cls.package_cache = {}

        if package_name in cls.package_cache:
            package = cls.package_cache[package_name]
        else:
            package = importlib.import_module(package_name)
            cls.package_cache[package_name] = package
        return package

    @classmethod
    def get_layer_cls(
            cls,
            package_name: str,
            layer_name: str
    ):
        return getattr(cls.__get_package(package_name), layer_name)

    @classmethod
    def get_layer_obj(
            cls,
            package_name: str,
            layer_name: str,
            layer_params: Dict[str, Any],
    ):
        return cls.get_layer_cls(package_name, layer_name)(**layer_params)
