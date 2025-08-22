# Copyright © 2025 PMoS. All rights reserved.

import math
from functools import reduce
from typing import Tuple, List, Optional, Iterable

from flowing.net.layer.utils import get_and_check_target_dim_param, pool_padding_and_kernel_size_check


class DataShapeChecker:
    @staticmethod
    def exist_dim(
            data_shape: Tuple[int, ...] | List[int],
            dim: Optional[int],
            data_shape_name: str = "data_shape",
    ):
        # check data_shape[dim] is ok
        if dim is not None:
            try:
                data_shape[dim]
            except IndexError:
                raise ValueError(
                    f"detect an unexpected {data_shape_name} as {data_shape}, "
                    f"expected {data_shape_name} should have {dim} dimension"
                )

    @staticmethod
    def check_dim(
            data_shape: Tuple[int, ...] | List[int],
            dim: int,
            value: int,
            data_shape_name: str = "data_shape",
    ):
        # check data_shape[dim]==value
        DataShapeChecker.exist_dim(data_shape, dim, data_shape_name)
        if data_shape[dim] != value:
            raise ValueError(
                f"detect an unexpected {data_shape_name} as {data_shape}, "
                f"expected it's {dim} dimensions is equal to in_channels as {value}"
            )

    @staticmethod
    def check_dim_divisible(
            data_shape: Tuple[int, ...] | List[int],
            dim: int,
            divisor: int,
            data_shape_name: str = "data_shape",
    ):
        # check (data_shape[dim]%divisor)==0
        DataShapeChecker.exist_dim(data_shape, dim, data_shape_name)
        if (data_shape[dim] % divisor) != 0:
            raise ValueError(
                f"detect an unexpected {data_shape_name} as {data_shape}, "
                f"expected {data_shape_name}[{dim}] can be divisible by {divisor}"
            )

    @staticmethod
    def shape_dim(
            data_shape: Tuple[int, ...] | List[int],
            dim: Optional[int],
            data_shape_name: str = "data_shape",
    ):
        # check if shape can be described as (N,C,...dim) or (C,...dim)
        if (dim is not None) and (len(data_shape) not in (dim + 1, dim + 2)):
            raise ValueError(
                f"detect an unexpected {data_shape_name} as {data_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

    @staticmethod
    def shape_at_least_length(
            data_shape: Tuple[int, ...] | List[int],
            length: int,
            data_shape_name: str = "data_shape",
    ):
        if len(data_shape) < length:
            raise ValueError(
                f"detect an unexpected {data_shape_name} as {data_shape}, "
                f"expected {data_shape_name} must be at least {length} dimensional"
            )


class OutputShapeCalculator:
    """
    pattern:
        OutputShapeCalculator.xxx(..., *input_shape: Tuple[int, ...] | List[int])

    tips:
        1. Before calling OutputShapeCalculator.xxx, we called Layer.content_check. So *don't* checking contents(params)
    util necessary.
    """

    @staticmethod
    def same_as_input_shape(
            *input_shape: Tuple[int, ...] | List[int],
    ) -> Tuple[Tuple[int, ...], ...]:
        return tuple(tuple(shape) for shape in input_shape)

    @staticmethod
    def divide_input_shape(
            dim: int,
            divisor: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        result = []
        for idx, shape in enumerate(input_shape):
            DataShapeChecker.check_dim_divisible(shape, dim, divisor)

            shape_list = list(shape)
            shape_list[dim] //= divisor
            result.append(tuple(shape_list))

        return tuple(result)

    @staticmethod
    def arithmetic_input_shape(
            *input_shape: Tuple[int, ...] | List[int],
    ):
        input_shape = sorted(input_shape, key=lambda item: len(item), reverse=True)

        prev = list(input_shape[0])
        for shape in input_shape:
            for idx in range(len(shape)):
                if shape[-idx - 1] != prev[-idx - 1]:
                    if shape[-idx - 1] == 1 or prev[-idx - 1] == 1:
                        prev[-idx - 1] = max(shape[-idx - 1], prev[-idx - 1])
                    else:
                        prev[-idx - 1] = -1
                # detect <=0 or not in (1, X)/(X, 1)/(X,X)
                if prev[-idx - 1] <= 0:
                    raise ValueError(
                        f"detect an unexpected input_shape as {input_shape}, "
                        f"has different postfix shapes"
                    )
        return tuple(prev),

    @staticmethod
    def convolution(
            dim: int,
            c_in: Optional[int],
            c_out: int,
            kernel_size: int | Tuple[int, ...],
            padding: int | Tuple[int, ...] | str,
            stride: int | Tuple[int, ...],
            dilation: int | Tuple[int, ...],
            output_padding: Optional[int],
            groups: int,
            all_bound_padding: bool,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        """
        padding: int | Tuple[int, ...] | str
            - int
            - Tuple[int, ...]
            - "same"
            - "valid"
        output_padding: Optional[int]
            - None
                calculate Conv
            - other
                calculate ConvTranspose
        all_bound_padding: bool
            - True
                padding:int | Tuple[int*(2*dim)] | str
            - False
                padding:int | Tuple[int*dim] | str
        """
        data_shape = input_shape[0]

        DataShapeChecker.shape_dim(data_shape, dim)

        kernel_size = get_and_check_target_dim_param(kernel_size, dim, 1, "kernel_size")
        stride = get_and_check_target_dim_param(stride, dim, 1, "stride")
        dilation = get_and_check_target_dim_param(dilation, dim, 0, "dilation")

        output_shape = list(data_shape)

        if padding == "same":
            if output_padding is None:
                for i in range(dim):
                    output_shape[-dim + i] = math.ceil(data_shape[-dim + i] / stride[i])
            else:
                for i in range(dim):
                    output_shape[-dim + i] = data_shape[-dim + i] * stride[i]
            return tuple(output_shape),
        elif padding == "valid":
            # as same as padding = 0
            padding = 0
            if output_padding is not None:
                output_padding = 0

        if all_bound_padding:
            padding = get_and_check_target_dim_param(padding, 2 * dim, 0, "padding")
            # from padding [C_1^1,C_1^2,...] to [C_1,...]
            padding = tuple(padding[i] + padding[i + 1] for i in range(0, 2 * dim, 2))
        else:
            padding = get_and_check_target_dim_param(padding, dim, 0, "padding")
            padding = tuple(p * 2 for p in padding)

        if c_in is not None:
            DataShapeChecker.check_dim(data_shape, -dim - 1, c_in)
        else:
            DataShapeChecker.exist_dim(data_shape, -dim - 1)
            c_in = data_shape[-dim - 1]

        # this is necessary, because this may called by LazyXConvXd
        if c_in % groups != 0:
            raise ValueError(
                f"detect an unexpected in_channels as {c_in} or groups as {groups}, "
                f"expected in_channels can be divisible by groups"
            )

        output_shape[-dim - 1] = c_out

        if output_padding is None:
            for i in range(dim):
                output_shape[-dim + i] = math.floor(
                    (data_shape[-dim + i] + padding[i] - dilation[i] * (kernel_size[i] - 1) - 1) / stride[i] + 1
                )
        else:
            output_padding = get_and_check_target_dim_param(output_padding, dim, 0, "output_padding")
            for i in range(dim):
                output_shape[-dim + i] = \
                    (data_shape[-dim + i] - 1) * stride[i] - padding[i] + dilation[i] * (kernel_size[i] - 1) + \
                    output_padding[i] + 1

        return tuple(output_shape),

    @staticmethod
    def dropout(
            dim: Optional[int],
            at_least_dim: Optional[int],
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        DataShapeChecker.shape_dim(data_shape, dim)

        if at_least_dim is not None:
            DataShapeChecker.shape_at_least_length(data_shape, at_least_dim)

        return tuple(data_shape),

    @staticmethod
    def linear(
            in_features: Optional[int],
            out_features: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        if in_features is not None:
            DataShapeChecker.check_dim(data_shape, -1, in_features)

        output_shape = list(data_shape)

        try:
            output_shape[-1] = out_features
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape has at least 1 dimension"
            )

        return tuple(output_shape),

    @staticmethod
    def bilinear(
            in1_features: int,
            in2_features: int,
            out_features: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data1_shape = list(input_shape[0])
        data2_shape = list(input_shape[1])

        DataShapeChecker.check_dim(
            data1_shape,
            -1,
            in1_features,
            "data1_shape"
        )
        DataShapeChecker.check_dim(
            data2_shape,
            -1,
            in2_features,
            "data2_shape"
        )

        return tuple(data1_shape[:-1] + [out_features]),

    @staticmethod
    def group_norm(
            num_channels: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        # (N,C,*)
        DataShapeChecker.shape_at_least_length(data_shape, 2)

        # c==num_channels
        DataShapeChecker.check_dim(data_shape, 1, num_channels)

        return tuple(data_shape),

    @staticmethod
    def layer_norm(
            normalized_shape: Tuple[int, ...] | List[int],
            begin_norm_axis: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        DataShapeChecker.exist_dim(data_shape, begin_norm_axis)

        if tuple(data_shape[begin_norm_axis:]) != tuple(normalized_shape):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape with shape [*] + {normalized_shape}"
            )

        return tuple(data_shape),

    @staticmethod
    def batch_norm(
            allowed_dims: Tuple[int, ...],  # (unbatched, batched) / (batched)
            num_features: Optional[int],
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        if len(data_shape) not in allowed_dims:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected data_shape has {allowed_dims} dimensions"
            )

        if num_features is not None:
            allowed_dim_index = allowed_dims.index(len(data_shape))
            # some norm like LazyInstanceNormXd only supports batched, so it's allowed_dims only be (batched)
            check_dim = allowed_dim_index if len(allowed_dims) == 2 else 1
            DataShapeChecker.check_dim(data_shape, check_dim, num_features)

        return tuple(data_shape),

    @staticmethod
    def adaptive_pool(
            dim: int,
            output_size: int | Tuple[int, ...],
            return_indices: bool,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        DataShapeChecker.shape_dim(data_shape, dim)

        output_size = get_and_check_target_dim_param(output_size, dim, 1, "output_size")

        output_shape = list(data_shape)
        for idx in range(dim):
            if output_size[idx] is not None:
                output_shape[-dim + idx] = output_size[idx]

        if return_indices:
            return tuple(output_shape), tuple(output_shape)
        return tuple(output_shape),

    @staticmethod
    def pool(
            dim: int,
            kernel_size: int | Tuple[int, ...],
            padding: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] | None,
            dilation: int | Tuple[int, ...],
            ceil_mode: bool,
            return_indices: bool,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        if len(data_shape) not in (dim + 1, dim + 2):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected {dim + 1} dimensions(unbatched) or {dim + 2} dimensions(batched) input"
            )

        kernel_size = get_and_check_target_dim_param(kernel_size, dim, 1, "kernel_size")
        padding = get_and_check_target_dim_param(padding, dim, 0, "padding")
        stride = get_and_check_target_dim_param(
            kernel_size if stride is None else stride, dim, 1, "stride"
        )
        dilation = get_and_check_target_dim_param(dilation, dim, 0, "dilation")

        pool_padding_and_kernel_size_check(padding=padding, kernel_size=kernel_size)

        output_shape = list(data_shape)
        truncate_func = math.ceil if ceil_mode else math.floor
        for idx in range(dim):
            output_shape[-dim + idx] = truncate_func(
                (output_shape[-dim + idx] + 2 * padding[idx] - dilation[idx] * (kernel_size[idx] - 1) - 1) \
                / stride[idx] + 1
            )

        if return_indices:
            return tuple(output_shape), tuple(output_shape)
        return tuple(output_shape),

    @staticmethod
    def max_unpool(
            dim: int,
            kernel_size: int | Tuple[int, ...],
            padding: int | Tuple[int, ...],
            stride: int | Tuple[int, ...] | None,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        result_shape, info_shape = input_shape

        if tuple(result_shape) != tuple(info_shape):
            raise ValueError(
                f"detect an unexpected result_shape as {result_shape} or info_shape as {info_shape}, "
                f"expected both of shapes should be same."
            )

        DataShapeChecker.shape_dim(result_shape, dim)

        kernel_size = get_and_check_target_dim_param(kernel_size, dim, 1, "kernel_size")
        padding = get_and_check_target_dim_param(padding, dim, 0, "padding")
        stride = get_and_check_target_dim_param(
            kernel_size if stride is None else stride, dim, 1, "stride"
        )

        output_shape = list(result_shape)
        for i in range(dim):
            output_shape[-dim + i] = (result_shape[-dim + i] - 1) * stride[i] - 2 * padding[i] + kernel_size[i]

        return tuple(output_shape),

    @staticmethod
    def concat(
            dim: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        prev_shape = None
        dim_sum = 0
        for shape in input_shape:
            shape = list(shape)
            if shape == [0, ]:
                continue

            DataShapeChecker.exist_dim(shape, dim)

            dim_sum += shape[dim]
            shape[dim] = -1

            if prev_shape is not None and shape != prev_shape:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"which has different shapes"
                )
            if prev_shape is None:
                prev_shape = shape

        # mean that all is zero
        if prev_shape is None:
            return (0,),

        prev_shape[dim] = dim_sum
        return tuple(prev_shape),

    @staticmethod
    def stack(
            dim: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        prev_shape = None
        for shape in input_shape:
            shape = list(shape)

            if prev_shape is not None and shape != prev_shape:
                raise ValueError(
                    f"detect an unexpected input_shape as {input_shape}, "
                    f"has different shapes"
                )
            if prev_shape is None:
                prev_shape = shape

        padding_num = -1
        output_shape = [padding_num] * (len(prev_shape) + 1)

        DataShapeChecker.exist_dim(output_shape, dim)
        output_shape[dim] = len(input_shape)

        rs_idx = 0
        for idx in range(len(prev_shape)):
            while output_shape[rs_idx] != padding_num:
                rs_idx += 1
            output_shape[rs_idx] = prev_shape[idx]
            rs_idx += 1

        return tuple(output_shape),

    @staticmethod
    def flatten(
            start_dim: int,
            end_dim: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        output_shape = []

        start_dim = start_dim if start_dim >= 0 else len(data_shape) + start_dim
        DataShapeChecker.exist_dim(data_shape, start_dim)
        end_dim = end_dim if end_dim >= 0 else len(data_shape) + end_dim
        DataShapeChecker.exist_dim(data_shape, end_dim)

        # this is necessary when (start_dim<0 and end_dim>0) or (start_dim>0 and end_dim<0)
        if start_dim > end_dim:
            raise ValueError(
                f"detect an unexpected start_dim as {start_dim} and end_dim as {end_dim}, "
                f"expected start_dim in front of end_dim"
            )

        mul = 1
        for dim, num in enumerate(data_shape):
            if dim < start_dim:
                output_shape.append(num)
            elif dim <= end_dim:
                mul *= num
            else:
                if mul != -1:
                    output_shape.append(mul)
                    mul = -1
                output_shape.append(num)
        if mul != -1:
            output_shape.append(mul)

        return tuple(output_shape),

    @staticmethod
    def unflatten(
            dim: int,
            unflattened_size: Tuple[int, ...],
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        dim = dim if dim >= 0 else len(data_shape) + dim
        DataShapeChecker.exist_dim(data_shape, dim)

        output_shape = list(data_shape)

        if unflattened_size.count(-1):
            neg_idx = -1
            output_mul = 1
            for idx, num in enumerate(unflattened_size):
                if num < 0:
                    neg_idx = idx
                else:
                    output_mul *= num

            if output_mul > data_shape[dim] or output_mul == 0 or output_shape[dim] % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected data_shape:{data_shape}, "
                    f"which {dim} dimension cannot unflatten to {unflattened_size}"
                )

            final_unflattened_size = list(unflattened_size)
            final_unflattened_size[neg_idx] = data_shape[dim] // output_mul

            output_shape[dim:dim + 1] = final_unflattened_size
        else:
            unflattened_size_mul = reduce(lambda x, y: x * y, unflattened_size)

            if output_shape[dim] != unflattened_size_mul:
                raise ValueError(
                    f"detect an unexpected data_shape as {data_shape}, "
                    f"expected data_shape's {dim + 1} dimension should be {unflattened_size_mul}"
                )

            output_shape[dim:dim + 1] = unflattened_size

        return tuple(output_shape),

    @staticmethod
    def permute(
            dims: Tuple[int, ...],
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        length = len(dims)
        if length != len(data_shape):
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's item has {length} dimensions"
            )

        output_shape = [0] * length
        try:
            for idx, dim in enumerate(dims):
                output_shape[idx] = data_shape[dim]
        except IndexError:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it can find indexes of {dims}"
            )

        return tuple(output_shape),

    @staticmethod
    def reshape(
            shape: Tuple[int, ...],
            *input_shape: Tuple[int, ...] | List[int],
    ):

        data_shape = input_shape[0]

        data_shape_mul = reduce(lambda x, y: x * y, data_shape)
        shape_mul = reduce(lambda x, y: x * y, shape)

        output_shape = list(shape)
        if shape.count(-1):
            neg_idx = -1
            output_mul = 1
            for idx, num in enumerate(shape):
                if num < 0:
                    neg_idx = idx
                else:
                    output_mul *= num

            if output_mul > data_shape_mul or output_mul == 0 or data_shape_mul % output_mul != 0:
                raise ValueError(
                    f"detect an unexpected data_shape as {data_shape}, "
                    f"which cannot reshape to {shape}"
                )
            output_shape[neg_idx] = data_shape_mul // output_mul
        elif data_shape_mul != shape_mul:
            raise ValueError(
                f"detect an unexpected data_shape as {data_shape}, "
                f"expected it's result of shape multiplication is {shape_mul}"
            )

        return tuple(output_shape),

    @staticmethod
    def squeeze(
            dim: Optional[int | Tuple[int, ...]],
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        output_shape = list(data_shape)

        if dim is None:
            output_shape = [x for x in output_shape if x != 1]
            return tuple(output_shape),

        if isinstance(dim, Iterable):
            dims = dim
        else:
            dims = [dim]

        need_remove_dims = set()
        for dim in dims:
            DataShapeChecker.exist_dim(output_shape, dim)
            if output_shape[dim] == 1:
                need_remove_dims.add(dim)

        output_shape = [output_shape[idx] for idx in range(len(output_shape)) if idx not in need_remove_dims]
        return tuple(output_shape),

    @staticmethod
    def unsqueeze(
            dim: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = list(input_shape[0])

        padding_num = -1
        output_shape = [padding_num] * (len(data_shape) + 1)

        DataShapeChecker.exist_dim(output_shape, dim)
        output_shape[dim] = 1

        rs_idx = 0
        for idx in range(len(data_shape)):
            while output_shape[rs_idx] != padding_num:
                rs_idx += 1
            output_shape[rs_idx] = data_shape[idx]
            rs_idx += 1

        return tuple(output_shape),

    @staticmethod
    def transpose(
            dim0: int,
            dim1: int,
            *input_shape: Tuple[int, ...] | List[int],
    ):
        data_shape = input_shape[0]

        output_shape = list(data_shape)

        DataShapeChecker.exist_dim(output_shape, dim0)
        DataShapeChecker.exist_dim(output_shape, dim1)

        dim_shape = output_shape[dim0]
        output_shape[dim0] = output_shape[dim1]
        output_shape[dim1] = dim_shape

        return tuple(output_shape),
