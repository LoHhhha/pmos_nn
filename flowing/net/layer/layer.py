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

    # Net(LayerContent(key-value))
    # using Annotated[type, Layer.LayerContent] to mark attr (class init args, key-value)
    LayerContent: str = "LayerContentMark"

    # net(LayerForwardBeforeDataArg, data_names, LayerForwardAfterDataArg, LayerForwardContent(key-value))
    # using Annotated[type, Layer.LayerForwardContent] to mark other forward args (key-value)
    LayerForwardContent: str = "LayerForwardContentMark"
    # using Annotated[type, Layer.LayerForwardBeforeDataArg/LayerForwardAfterDataArg, LayerForwardArgPriority(X)]
    # to mark other forward args (only value)
    LayerForwardBeforeDataArg: str = "LayerForwardBeforeDataArgMark"
    LayerForwardAfterDataArg: str = "LayerForwardAfterDataArgMark"

    class LayerForwardArgPriority:
        priority: int

        def __init__(self, priority: int):
            self.priority = priority

    _api_name: str = ...
    _api_init_func: Optional[Callable] = None
    _api_forward_func: Optional[Callable] = None

    layer_name: str = ...
    data_names: List[str | None] = ...
    data_amount: int = ...
    output_name: str = ...  # through it maybe a tuple but also use one name.
    output_amount: int = ...  # when output_size == 1 means output_name is a var, or it is a tuple.

    init_error_msg: List[str]
    __showed_init_error_msg: bool

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
                f"Detect kwargs is not empty in Layer.__init__, "
                f"confirming kwargs as {kwargs} is ok."
            )

        self.init_error_msg = []
        self.__showed_init_error_msg = False

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
                self.init_error_msg.append(str(e))
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
                    f"detected an unexpected input_shape as {input_shape}, "
                    f"expecting len is {instance.data_amount}"
                )
            return output_shape(instance, *input_shape, **kwargs)

        return wrapped_function

    @staticmethod
    def data_amount_not_zero_check_wrap(output_shape):
        @wraps(output_shape)
        def wrapped_function(instance, *input_shape: Tuple[int, ...] | List[int], **kwargs):
            if instance.data_amount == 0:
                raise ValueError(
                    f"detected an unexpected empty input_shape as {input_shape}, "
                    f"expecting at least 1 item"
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

    def get_contents(self, content_type) -> List[Tuple[str, Any]]:
        bags = []  # key, value, priority
        for cls in self.__class__.__mro__:
            if not issubclass(cls, Layer):
                continue
            for key, value_cls in cls.__annotations__.items():
                if value_cls.__name__ == Annotated.__name__ and content_type in value_cls.__metadata__:
                    priority = 0
                    for metadata in value_cls.__metadata__:
                        if isinstance(metadata, Layer.LayerForwardArgPriority):
                            priority = metadata.priority
                    bags.append((key, getattr(self, key), priority))

        bags.sort(key=lambda item: item[2])
        return [(item[0], item[1]) for item in bags]

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

        args = []
        args.extend(repr(item[1]) for item in self.get_contents(Layer.LayerForwardBeforeDataArg))
        if data_names_as_tuple:
            args.append(f"({', '.join(self.data_names)})")
        else:
            args.extend(self.data_names)
        args.extend(repr(item[1]) for item in self.get_contents(Layer.LayerForwardAfterDataArg))

        if data_names_identifiers is not None:
            if len(args) != len(data_names_identifiers):
                raise ValueError(
                    f"detected an unexpected data_names_identifiers as {data_names_identifiers}, "
                    f"expecting length is {len(args)}"
                )
            args = (f"{key}={value}" for key, value in zip(data_names_identifiers, args))
        return block.join((
            *args,
            *(f"{key}={repr(value)}" for key, value in extend_params),
        ))

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

    def __msg_wrapper(self, code_func: Callable, *arg, **kwargs) -> Tuple[str, ...]:
        codes = []
        code = code_func(*arg, **kwargs)
        if not self.__showed_init_error_msg and len(self.init_error_msg) and len(code):
            self.__showed_init_error_msg = True
            codes.append(f"# FIXME! Checking the following warnings:")
            codes.extend([f"# \t- {msg}" for msg in self.init_error_msg])
        codes.extend(code)
        return tuple(codes)

    def init_code_with_msg(self, *arg, **kwargs) -> Tuple[str, ...]:
        return self.__msg_wrapper(self.init_code, *arg, **kwargs)

    def forward_code_with_msg(self, *arg, **kwargs) -> Tuple[str, ...]:
        return self.__msg_wrapper(self.forward_code, *arg, **kwargs)

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
