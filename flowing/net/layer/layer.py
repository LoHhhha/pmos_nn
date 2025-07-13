# Copyright © 2024-2025 PMoS. All rights reserved.

import inspect
from functools import wraps
from typing import List, Tuple, Annotated, Optional, Any, Callable
from abc import ABC, abstractmethod

from flowing.shower import Logger

__all__ = [
    'Layer'
]


class Layer(ABC):
    """
    <extra_class_code>

    class Net(xxx):
        def __init__(self):
            <init_code>

        def forward/xxx(self):
            <forward_code>
    """
    # using Annotated[type, Layer.LayerContent] to mark attr (class init args)
    LayerContent: str = "LayerContentMark"
    # using Annotated[type, Layer.LayerForwardContent] to mark other forward args
    LayerForwardContent: str = "LayerForwardContentMark"

    _api_name: str = ...
    _api_init_func: Optional[Callable] = None
    _api_forward_func: Optional[Callable] = None

    layer_name: str = ...
    data_names: List[str | None] = ...
    data_amount: int = ...
    output_name: str = ...  # through it maybe a tuple but also use one name.
    output_amount: int = ...  # when output_size == 1 means output_name is a var, or it is a tuple.

    def __init__(self, data_amount: Optional[int] = None):
        """
        Unless data_amount is setting error, don't verify the params and raise another exception in here.
        Ensure users can generate their own modules in their way.

        So only assign <LayerContent> on __init__(), and remember to call super().__init__(data_amount)!
        """
        if data_amount is not None:
            if self.data_amount is ...:
                self.data_amount = data_amount
            elif self.data_amount != data_amount:
                raise ValueError(
                    f'{self._api_name}.data_amount expected to be {self.data_amount}, but got {data_amount}'
                )
        elif self.data_amount is ...:
            raise ValueError(
                f'{self._api_name}.data_amount need to be implement'
            )

        self.data_names = [None] * self.data_amount

    @staticmethod
    def named_check(init_code):
        @wraps(init_code)
        def wrapped_function(instance, *args, **kwargs):
            if instance.layer_name is ...:
                raise NotImplementedError(
                    "please first assign the Layer.layer_name before you call Layer.init_code()"
                )
            return init_code(instance, *args, **kwargs)

        return wrapped_function

    @staticmethod
    def injected_check(forward_code):
        @wraps(forward_code)
        def wrapped_function(instance, *args, **kwargs):
            if instance.layer_name is ... or instance.output_name is ... or instance.data_names is ...:
                raise NotImplementedError(
                    "please first assign the Layer.layer_name, Layer.output_name and Layer.data_name before you call "
                    "Layer.forward_code()"
                )
            return forward_code(instance, *args, **kwargs)

        return wrapped_function

    @staticmethod
    def input_shape_check(output_shape):
        @wraps(output_shape)
        def wrapped_function(instance, *input_shape: Tuple[int, ...] | List[int], **kwargs):
            if len(input_shape) != instance.data_amount:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"expected len is {instance.data_amount}"
                )
            return output_shape(instance, *input_shape, **kwargs)

        return wrapped_function

    @staticmethod
    def data_amount_not_zero_check(output_shape):
        @wraps(output_shape)
        def wrapped_function(instance, *input_shape: Tuple[int, ...] | List[int], **kwargs):
            if instance.data_amount == 0:
                raise ValueError(
                    f"detect an unexpected empty input_shape as {input_shape}, "
                    f"expected at least 1 item"
                )
            return output_shape(instance, *input_shape, **kwargs)

        return wrapped_function

    @staticmethod
    def _trim_params(params: List[Tuple[str, Any]], func: Optional[Callable]) -> List[Tuple[str, Any]]:
        if func is None:
            return params

        try:
            args_info = inspect.getfullargspec(func)
        except Exception as e:
            Logger.warning(f"Detect an exception as {e} during trim_params using func={func}, skipped.")
            return params

        key2default = {}
        default_values = args_info.defaults
        if default_values is None:
            default_values = []
        for idx, value in enumerate(default_values):
            key2default[args_info.args[-len(args_info.defaults) + idx]] = value

        return list((key, value) for key, value in params if (key not in key2default) or (key2default[key] != value))

    @injected_check
    def get_forward_args(
            self,
            block: str = ", ",
            extend_params: Optional[List[Tuple[str, Any]]] = None,
            data_names_as_tuple: bool = False,
            data_names_identifiers: Optional[List[str]] = None,
    ) -> str:
        # ensure data_name is not ...
        if extend_params is None:
            extend_params = []
        args = self.data_names if not data_names_as_tuple else (f"({", ".join(self.data_names)})",)
        if data_names_identifiers is not None:
            if len(args) != len(data_names_identifiers):
                raise ValueError(
                    f"detect an unexpected data_names_identifiers as {data_names_identifiers}, "
                    f"expected length is {len(args)}"
                )
            args = (f"{key}={value}" for key, value in zip(data_names_identifiers, args))
        return block.join((
            *args,
            *(f"{key}={repr(value)}" for key, value in extend_params),
        ))

    def get_contents(self, content_type) -> List[Tuple[str, Any]]:
        contents = []
        for cls in self.__class__.__mro__:
            if not issubclass(cls, Layer):
                continue
            for key, value_cls in cls.__annotations__.items():
                if value_cls.__name__ == Annotated.__name__ and content_type in value_cls.__metadata__:
                    contents.append((key, getattr(self, key)))

        return contents

    # planning
    # def extra_class_code(self) -> Tuple[Tuple[str, str], ...]:
    #     """
    #     Return ((class_name, class_code), ...)
    #     """
    #     return ()

    @named_check
    def init_code(self, package: str = "", add_self: bool = True) -> Tuple[str, ...]:
        init_params = self.get_contents(Layer.LayerContent)
        init_params = self._trim_params(init_params, self._api_init_func)
        init_params_str = ", ".join(f"{key}={repr(value)}" for key, value in init_params)
        package_name = f"{package}." if package and not package.endswith(".") else package
        return f"{"self." if add_self else ""}{self.layer_name} = {package_name}{self._api_name}({init_params_str})",

    @injected_check
    def forward_code(self, identifier: Optional[str] = None) -> Tuple[str, ...]:
        # using "self.<layer_name>" when identifier is None
        forward_params = self.get_contents(Layer.LayerForwardContent)
        forward_params = self._trim_params(forward_params, self._api_forward_func)
        return (f"{self.output_name} = {f'self.{self.layer_name}' if identifier is None else identifier}"
                f"({self.get_forward_args(extend_params=forward_params)})"),

    @abstractmethod
    @input_shape_check
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        """
        Return what shape of date will get if push [input_shape] data to Layer.
        """
        ...

    def __repr__(self):
        return f"Layer:{self._api_name}(data_amount={self.data_amount},output_amount={self.output_amount})"
