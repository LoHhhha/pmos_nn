# Copyright © 2024-2025 PMoS. All rights reserved.

import inspect
from functools import wraps
from typing import List, Tuple, Annotated, Optional, Any, Callable, Dict
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

    def __init__(self, data_amount: Optional[int] = None, **kwargs):
        """
        Unless data_amount is setting error, don't verify the params and raise another exception in here.
        Ensure users can generate their own modules in their way.

        So only assign <LayerContent> on __init__(), and remember to call super().__init__(data_amount)!
        """

        # remove some known key-value
        kwargs.pop("ignore_content_exception", False)
        if len(kwargs):
            Logger.warning(
                f"detect kwargs is not empty in Layer.__init__, "
                f"confirmed kwargs as {kwargs} is ok."
            )

        if data_amount is not None:
            if self.data_amount is ...:
                self.data_amount = data_amount
            elif self.data_amount != data_amount:
                raise ValueError(
                    f"{self._api_name}.data_amount expected to be {self.data_amount}, but got {data_amount}"
                )
        elif self.data_amount is ...:
            raise ValueError(
                f"{self._api_name}.data_amount need to be implement"
            )

        self.data_names = [None] * self.data_amount

    def __init_subclass__(cls):
        super().__init_subclass__()

        # wrap the __init__, check content after __init__
        # if some class don't rewrite content_check, skip.
        if not "content_check" in cls.__dict__:
            return

        sub_cls_init = cls.__init__

        def wrapped_init(self, *args, **kwargs):
            sub_cls_init(self, *args, **kwargs)

            ignore_content_exception = kwargs.get("ignore_content_exception", False)
            try:
                cls.content_check(self)
            except Exception as e:
                if not ignore_content_exception:
                    raise e
                else:
                    Logger.warning(
                        f"{self} content checking failed due to {e}, "
                        f"but ignored."
                    )

        cls.__init__ = wrapped_init

    def content_check(self):
        """
        Check if contents are valid, this will call after __init__ automatically (all class's content_check)
        may raise ValueError
            if you want to ignore Exception, using:
                Layer(..., ignore_content_exception=True)
        """
        pass

    def named_check(self):
        if self.layer_name is ...:
            raise NotImplementedError(
                "please first assign the Layer.layer_name"
            )

    def injected_check(self):
        if self.layer_name is ... or self.output_name is ... or self.data_names is ...:
            raise NotImplementedError(
                "please first assign the Layer.layer_name, Layer.output_name and Layer.data_name"
            )

    @staticmethod
    def named_check_wrap(func):
        @wraps(func)
        def wrapped_function(instance, *args, **kwargs):
            instance.named_check()
            return func(instance, *args, **kwargs)

        return wrapped_function

    @staticmethod
    def injected_check_wrap(func):
        @wraps(func)
        def wrapped_function(instance, *args, **kwargs):
            instance.injected_check()
            return func(instance, *args, **kwargs)

        return wrapped_function

    @staticmethod
    def input_shape_check_wrap(output_shape):
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
    def data_amount_not_zero_check_wrap(output_shape):
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
            args_info = inspect.signature(func)
        except Exception as e:
            Logger.warning(f"Detect an exception as {e} during trim_params using func={func}, skipped.")
            return params

        key2default = {}
        for name, param in args_info.parameters.items():
            if param.default != param.empty:
                key2default[name] = param.default

        return list((key, value) for key, value in params if (key not in key2default) or (key2default[key] != value))

    @injected_check_wrap
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
        extend_params = self._trim_params(extend_params, self._api_forward_func)

        args = self.data_names if not data_names_as_tuple else (f"({', '.join(self.data_names)})",)
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

    def init_code(
            self,
            package: str = "",
            add_self: bool = True,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        init_params = self.get_contents(Layer.LayerContent)
        if extend_params is not None:
            init_params.extend((key, value) for key, value in extend_params.items())
        init_params = self._trim_params(init_params, self._api_init_func)
        init_params_str = ", ".join(f"{key}={repr(value)}" for key, value in init_params)
        package_name = f"{package}." if package and not package.endswith(".") else package

        right_value = f"{package_name}{self._api_name}({init_params_str})"
        if only_right_value:
            return right_value,

        self.named_check()
        return f"{'self.' if add_self else ''}{self.layer_name} = {right_value}",

    @injected_check_wrap
    def forward_code(
            self,
            identifier: Optional[str] = None,
            extend_params: Dict[str, Any] = None,
            only_right_value: bool = False,
    ) -> Tuple[str, ...]:
        # using "self.<layer_name>" when identifier is None
        forward_params = self.get_contents(Layer.LayerForwardContent)
        if extend_params is not None:
            forward_params.extend((key, value) for key, value in extend_params.items())

        right_value = (f"{('self.' + self.layer_name) if identifier is None else identifier}"
                       f"({self.get_forward_args(extend_params=forward_params)})")
        if only_right_value:
            return right_value,
        return f"{self.output_name} = {right_value}",

    @abstractmethod
    @input_shape_check_wrap
    def output_shape(self, *input_shape: Tuple[int, ...] | List[int], **kwargs) -> Tuple[Tuple[int, ...], ...]:
        """
        Return what shape of date will get if push [input_shape] data to Layer.
        may raise ValueError
        """
        ...

    def __repr__(self):
        return (
            f"Layer:{self._api_name}("
            f"data_amount={self.data_amount}, "
            f"output_amount={self.output_amount}, "
            f"LayerContent={self.get_contents(Layer.LayerContent)}, "
            f"LayerForwardContent={self.get_contents(Layer.LayerForwardContent)})"
        )
