const operatorBarNamespace = {};
operatorBarNamespace.baseNodeCssClass = "node";
operatorBarNamespace.outputEndpointDefaultStyle = {
    endpoint: {
        type: "Rectangle",
        options: {
            width: 20,
            height: 15,
        },
    },
    connectorOverlays: [
        {
            type: "Arrow",
            options: { width: 15, length: 15, location: 1 },
        },
    ],
    connector: "Bezier",
    maxConnections: -1,
    source: true,
};
operatorBarNamespace.inputEndpointDefaultStyle = {
    endpoint: {
        type: "Rectangle",
        options: {
            width: 20,
            height: 15,
        },
    },
    target: true,
};
operatorBarNamespace.argsInputType = {
    text: {
        element: "input",
        type: "text",
    },
    select: {
        element: "select",
        type: null,
    },
};
operatorBarNamespace.argsType = {
    strVar: {
        reg: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value;
        },
        note: "Please input a identifier which starting with letter or underline and only containing letter, underline and number such as 'a1', '_var'.",
    },
    strInt: {
        reg: /^[-+]?\d+$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseInt(value);
        },
        note: "Please input a integer such as 19528.",
    },
    strIntOrNone: {
        reg: /^(([-+]?\d+)|(None))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            if (value === "None") return null;
            return parseInt(value);
        },
        note: "Please input 'None' or a integer such as 19528.",
    },
    strFloat: {
        reg: /^[-+]?\d+\.?\d*$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseFloat(value);
        },
        note: "Please input a float such as 19528 or -0.15.",
    },
    strTuple: {
        reg: /^\([-+]?[1-9]\d*(\,[-+]?[1-9]\d*)*\)$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
        },
        note: "Please input a list like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'.",
    },
    strIntOrTuple: {
        reg: /^((\([-+]?[1-9]\d*(\,[-+]?[1-9]\d*)*\))|([-+]?\d+))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            const ret = value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            if (ret.length === 1) return ret[0];
            return ret;
        },
        note: "Please input a integer or a list like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'.",
    },
    strIntOrTupleOrNone: {
        reg: /^((\([-+]?[1-9]\d*(\,[-+]?[1-9]\d*)*\))|([-+]?\d+)|(None))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            if (value === "None") return null;
            const ret = value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            if (ret.length === 1) return ret[0];
            return ret;
        },
        note: "Please input 'None', a integer or a list like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'.",
    },
    bool: {
        reg: ".*",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            return value == "True";
        },
        values: ["False", "True"],
        note: null,
    },
    pytorchPaddingMode: {
        reg: ".*",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            return value;
        },
        values: ["zeros", "reflect", "replicate", "circular"],
        note: null,
    },
};
operatorBarNamespace.framework = {
    all: "all",
    pytorch: "PyTorch",
    tensorflow: "TensorFlow",
};
operatorBarNamespace.frameworkOrder = {
    all: 0,
    PyTorch: 1,
    TensorFlow: 2,
};
operatorBarNamespace.typeCode = {
    IO: 0,
    math: 1,
    transform: 2,
    activation: 3,
    convolution: 4,
    pool: 5,
    linear: 6,
};
operatorBarNamespace.operators = [
    {
        apiName: "Input",
        extendCssClass: ["Input"],
        typeCode: operatorBarNamespace.typeCode.IO,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [{ name: "name", short: "N" }],
        args: [
            {
                name: "name",
                type: operatorBarNamespace.argsType.strVar,
                default: "None",
            },
            {
                name: "shape",
                type: operatorBarNamespace.argsType.strTuple,
                default: "(1,3,64,64)",
            },
        ],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Output",
        extendCssClass: ["Output"],
        typeCode: operatorBarNamespace.typeCode.IO,
        inputEnd: ["data"],
        outputEnd: [],
        outlines: [{ name: "name", short: "N" }],
        args: [
            {
                name: "name",
                type: operatorBarNamespace.argsType.strVar,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Add",
        extendCssClass: ["Add"],
        typeCode: operatorBarNamespace.typeCode.math,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Subtract",
        extendCssClass: ["Subtract"],
        typeCode: operatorBarNamespace.typeCode.math,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Multiply",
        extendCssClass: ["Multiply"],
        typeCode: operatorBarNamespace.typeCode.math,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Divide",
        extendCssClass: ["Divide"],
        typeCode: operatorBarNamespace.typeCode.math,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Reshape",
        extendCssClass: ["Reshape"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_shape", short: "O" }],
        args: [
            {
                name: "output_shape",
                type: operatorBarNamespace.argsType.strTuple,
                default: "(-1,3,64,64)",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.reshape.html",
    },
    {
        apiName: "Flatten",
        extendCssClass: ["Flatten"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "start_dim", short: "S" },
            { name: "end_dim", short: "E" },
        ],
        args: [
            {
                name: "start_dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "end_dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "-1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Flatten.html#torch.nn.Flatten",
    },
    {
        apiName: "Unflatten",
        extendCssClass: ["Unflatten"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "dim", short: "D" },
            { name: "unflattened_size", short: "T" },
        ],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "unflattened_size",
                type: operatorBarNamespace.argsType.strTuple,
                default: "(16,16)",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Flatten.html#torch.nn.Flatten",
    },
    {
        apiName: "Dropout",
        extendCssClass: ["Dropout"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Dropout.html#torch.nn.Dropout",
    },
    {
        apiName: "Dropout1d",
        extendCssClass: ["Dropout1d"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Dropout1d.html#torch.nn.Dropout1d",
    },
    {
        apiName: "Dropout2d",
        extendCssClass: ["Dropout2d"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Dropout2d.html#torch.nn.Dropout2d",
    },
    {
        apiName: "Dropout3d",
        extendCssClass: ["Dropout3d"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Dropout3d.html#torch.nn.Dropout3d",
    },
    {
        apiName: "Identity",
        extendCssClass: ["Identity"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Identity.html#torch.nn.Identity",
    },
    {
        apiName: "ReLU",
        extendCssClass: ["ReLU"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ReLU.html#torch.nn.ReLU",
    },
    {
        apiName: "LeakyReLU",
        extendCssClass: ["LeakyReLU"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "negative_slope ",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.01",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LeakyReLU.html#torch.nn.LeakyReLU",
    },
    {
        apiName: "SELU",
        extendCssClass: ["SELU"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.SELU.html#torch.nn.SELU",
    },
    {
        apiName: "CELU",
        extendCssClass: ["CELU"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "alpha",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1.0",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.CELU.html#torch.nn.CELU",
    },
    {
        apiName: "Sigmoid",
        extendCssClass: ["Sigmoid"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Sigmoid.html#torch.nn.Sigmoid",
    },
    {
        apiName: "Softmax",
        extendCssClass: ["Softmax"],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "dim", short: "D" }],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softmax.html#torch.nn.Softmax",
    },
    {
        apiName: "Conv1d",
        extendCssClass: ["Conv1d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Conv1d.html#torch.nn.Conv1d",
    },
    {
        apiName: "Conv2d",
        extendCssClass: ["Conv2d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html#torch.nn.Conv2d",
    },
    {
        apiName: "Conv3d",
        extendCssClass: ["Conv3d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Conv3d.html#torch.nn.Conv3d",
    },
    {
        apiName: "LazyConv1d",
        extendCssClass: ["LazyConv1d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyConv1d.html#torch.nn.LazyConv1d",
    },
    {
        apiName: "LazyConv2d",
        extendCssClass: ["LazyConv2d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyConv2d.html#torch.nn.LazyConv2d",
    },
    {
        apiName: "LazyConv3d",
        extendCssClass: ["LazyConv3d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyConv3d.html#torch.nn.LazyConv3d",
    },
    {
        apiName: "ConvTranspose1d",
        extendCssClass: ["ConvTranspose1d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose1d.html#torch.nn.ConvTranspose1d",
    },
    {
        apiName: "ConvTranspose2d",
        extendCssClass: ["ConvTranspose2d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose2d.html#torch.nn.ConvTranspose2d",
    },
    {
        apiName: "ConvTranspose3d",
        extendCssClass: ["ConvTranspose3d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose3d.html#torch.nn.ConvTranspose3d",
    },
    {
        apiName: "LazyConvTranspose1d",
        extendCssClass: ["LazyConvTranspose1d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyConvTranspose1d.html#torch.nn.LazyConvTranspose1d",
    },
    {
        apiName: "LazyConvTranspose2d",
        extendCssClass: ["LazyConvTranspose2d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyConvTranspose2d.html#torch.nn.LazyConvTranspose2d",
    },
    {
        apiName: "LazyConvTranspose3d",
        extendCssClass: ["LazyConvTranspose3d"],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyConvTranspose3d.html#torch.nn.LazyConvTranspose3d",
    },
    {
        apiName: "MaxPool1d",
        extendCssClass: ["MaxPool1d"],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "return_indices", short: "I" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.MaxPool1d.html#torch.nn.MaxPool1d",
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxPool2d",
        extendCssClass: ["MaxPool2d"],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "return_indices", short: "I" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.MaxPool2d.html#torch.nn.MaxPool2d",
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxPool3d",
        extendCssClass: ["MaxPool3d"],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "return_indices", short: "I" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "1",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.MaxPool3d.html#torch.nn.MaxPool3d",
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxUnpool1d",
        extendCssClass: ["MaxUnpool1d"],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.MaxUnpool1d.html#torch.nn.MaxUnpool1d",
    },
    {
        apiName: "MaxUnpool2d",
        extendCssClass: ["MaxUnpool2d"],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.MaxUnpool2d.html#torch.nn.MaxUnpool2d",
    },
    {
        apiName: "MaxUnpool3d",
        extendCssClass: ["MaxUnpool3d"],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strIntOrTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.MaxUnpool3d.html#torch.nn.MaxUnpool3d",
    },
    {
        apiName: "Linear",
        extendCssClass: ["Linear"],
        typeCode: operatorBarNamespace.typeCode.linear,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_features", short: "I" },
            { name: "out_features", short: "O" },
        ],
        args: [
            {
                name: "in_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "out_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.Linear.html#torch.nn.Linear",
    },
    {
        apiName: "LayerLinear",
        extendCssClass: ["LayerLinear"],
        typeCode: operatorBarNamespace.typeCode.linear,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "out_features", short: "O" }],
        args: [
            {
                name: "out_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.ac.cn/docs/stable/generated/torch.nn.LazyLinear.html#torch.nn.LazyLinear",
    },
];
operatorBarNamespace.operators.sort(function (a, b) {
    if (a.framework !== b.framework)
        return operatorBarNamespace.frameworkOrder[a.framework] <
            operatorBarNamespace.frameworkOrder[b.framework]
            ? -1
            : 1;
    if (a.typeCode === b.typeCode) return 0;
    return a.typeCode < b.typeCode ? -1 : 1;
});
operatorBarNamespace.connectionRule = [
    {
        name: "SelfNotSelf",
        tip: "Do not connect node to itself!",
        check: (srcNode, tarNode) => {
            return srcNode.id === tarNode.id;
        },
    },
    {
        name: "InputNotOutput",
        tip: "Do not connect input to output!",
        check: (srcNode, tarNode) => {
            return (
                srcNode.config.apiName === "Input" &&
                tarNode.config.apiName === "Output"
            );
        },
    },
    {
        name: "MaxPoolIndices",
        tip: "This MaxPool node not return indices, don't use it's indices!",
        check: (srcNode, tarNode, srcEndpointIdx, tarEndpointIdx) => {
            return (
                srcNode.config.apiName.includes("MaxPool") &&
                srcEndpointIdx === 1 &&
                !operatorBarNamespace.argsType.bool.getValue(
                    srcNode.content.return_indices
                )
            );
        },
    },
];
