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
        reg: /^[-+]?\d+\.?\d*(e[-+]?\d+)$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseFloat(value);
        },
        note: "Please input a float such as 19528, -0.15 or 3.14e-2",
    },
    strFloatOrNone: {
        reg: /^(([-+]?\d+\.?\d*(e[-+]?\d+))|(None))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseFloat(value);
        },
        note: "Please input a float such as 19528, -0.15 or 3.14e-2",
    },
    strTuple: {
        reg: /^\([-+]?\d+(\,[-+]?\d+)*\)$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
        },
        note: "Please input a tuple containing integer like string which divided by ',' and included by '(' and ')' such as '(-1,3,64,64)'.",
    },
    strNotNegTuple: {
        reg: /^\(\d+(\,\d+)*\)$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value.match(/\d+/g).map((item) => {
                return parseInt(item, 10);
            });
        },
        note: "Please input a tuple containing nonnegative integer like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'.",
    },
    strIntOrTuple: {
        reg: /^((\([-+]?\d+(\,[-+]?\d+)*\))|([-+]?\d+))$/,
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
        reg: /^((\([-+]?\d+(\,[-+]?\d+)*\))|([-+]?\d+)|(None))$/,
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
            return value === "True";
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
    pytorchDevice: {
        reg: ".*",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            if (value === "default") return null;
            return value;
        },
        values: ["default", "cpu", "cuda", "mps", "xpu", "xla", "mate"],
        note: null,
    },
    pytorchDataType: {
        reg: ".*",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            if (value === "default") return null;
            return value;
        },
        values: [
            "default",
            "bfloat16",
            "float16",
            "float32",
            "float64",
            "uint8",
            "int8",
            "int16",
            "int32",
            "int64",
            "bool",
            "complex64",
            "complex128",
        ],
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
    data: 2,
    transform: 3,
    activation: 4,
    convolution: 5,
    pool: 6,
    linear: 7,
    normalization: 8,
};
operatorBarNamespace.typeInfo = {};
for (const key in operatorBarNamespace.typeCode) {
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    operatorBarNamespace.typeInfo[operatorBarNamespace.typeCode[key]] = {
        name: name,
        code: operatorBarNamespace.typeCode[key],
    };
}
/**
 * operator(
 *      apiName:String
 *      extendCssClass:Array<String>
 *      typeCode:operatorBarNamespace.typeCode
 *      inputEnd(Name):Array<String>
 *      outputEnd(Name):Array<String>
 *      outlines:Array<{name:String, short(Name):String}>
 *      args:Array<{name:String, type:operatorBarNamespace.argsType, default(Value)}>
 *      framework:operatorBarNamespace.framework
 *      link:String/null
 *      outputShapeComeFromArg:String/null
 *          when inputEnd is empty, this must be set!
 *      changeCallBack:Function<void(Node)>
 * )
 */
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
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(1,3,64,64)",
            },
        ],
        framework: operatorBarNamespace.framework.all,
        link: null,
        outputShapeComeFromArg: "shape",
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
        apiName: "Rand",
        extendCssClass: ["Rand"],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "device",
                type: operatorBarNamespace.argsType.pytorchDevice,
                default: "default",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.pytorchDataType,
                default: "default",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.rand.html#torch.rand",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "RandNormal",
        extendCssClass: ["RandNormal"],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "device",
                type: operatorBarNamespace.argsType.pytorchDevice,
                default: "default",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.pytorchDataType,
                default: "default",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.randn.html#torch.randn",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "RandInt",
        extendCssClass: ["RandInt"],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [
            { name: "low", short: "L" },
            { name: "high", short: "H" },
        ],
        args: [
            {
                name: "size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "low",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
            {
                name: "high",
                type: operatorBarNamespace.argsType.strInt,
                default: "16",
            },
            {
                name: "device",
                type: operatorBarNamespace.argsType.pytorchDevice,
                default: "default",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.pytorchDataType,
                default: "default",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.randint.html#torch.randint",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Ones",
        extendCssClass: ["Ones"],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "device",
                type: operatorBarNamespace.argsType.pytorchDevice,
                default: "default",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.pytorchDataType,
                default: "default",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.ones.html#torch.ones",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Zeros",
        extendCssClass: ["Zeros"],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "device",
                type: operatorBarNamespace.argsType.pytorchDevice,
                default: "default",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.pytorchDataType,
                default: "default",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.zeros.html#torch.zeros",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Full",
        extendCssClass: ["Full"],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [{ name: "fill_value", short: "V" }],
        args: [
            {
                name: "size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "fill_value",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.0",
            },
            {
                name: "device",
                type: operatorBarNamespace.argsType.pytorchDevice,
                default: "default",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.pytorchDataType,
                default: "default",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.full.html#torch.full",
        outputShapeComeFromArg: "size",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Flatten.html#torch.nn.Flatten",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Unflatten.html#torch.nn.Unflatten",
    },
    {
        apiName: "Cat",
        extendCssClass: ["Cat"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [{ name: "dim", short: "D" }],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.cat.html#torch.cat",
    },
    {
        apiName: "Stack",
        extendCssClass: ["Stack"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [{ name: "dim", short: "D" }],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.stack.html#torch.stack",
    },
    {
        apiName: "Squeeze",
        extendCssClass: ["Squeeze"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "dim", short: "D" }],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.squeeze.html#torch-squeeze",
    },
    {
        apiName: "Unsqueeze",
        extendCssClass: ["Unsqueeze"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "dim", short: "D" }],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.unsqueeze.html#torch-unsqueeze",
    },
    {
        apiName: "Permute",
        extendCssClass: ["Permute"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "dims", short: "D" }],
        args: [
            {
                name: "dims",
                type: operatorBarNamespace.argsType.strTuple,
                default: "(2,1,0)",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.permute.html#torch-permute",
    },
    {
        apiName: "Transpose",
        extendCssClass: ["Transpose"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "dim0", short: "D0" },
            { name: "dim1", short: "D1" },
        ],
        args: [
            {
                name: "dim0",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
            {
                name: "dim1",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.transpose.html",
    },
    {
        apiName: "RandLike",
        extendCssClass: ["RandLike"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.rand_like.html#torch.rand_like",
    },
    {
        apiName: "RandNormalLike",
        extendCssClass: ["RandNormalLike"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.randn_like.html#torch.randn_like",
    },
    {
        apiName: "RandNormalLike",
        extendCssClass: ["RandNormalLike"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [
            { name: "low", short: "L" },
            { name: "high", short: "H" },
        ],
        args: [
            {
                name: "low",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
            {
                name: "high",
                type: operatorBarNamespace.argsType.strInt,
                default: "16",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.randint_like.html#torch.randint_like",
    },
    {
        apiName: "OnesLike",
        extendCssClass: ["OnesLike"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.ones_like.html#torch.ones_like",
    },
    {
        apiName: "ZerosLike",
        extendCssClass: ["ZerosLike"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.zeros_like.html#torch.zeros_like",
    },
    {
        apiName: "FullLike",
        extendCssClass: ["FullLike"],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [{ name: "fill_value", short: "V" }],
        args: [
            {
                name: "fill_value",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.0",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.full_like.html#torch.full_like",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout.html#torch.nn.Dropout",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout1d.html#torch.nn.Dropout1d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout2d.html#torch.nn.Dropout2d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout3d.html#torch.nn.Dropout3d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Identity.html#torch.nn.Identity",
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
                name: "negative_slope",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConv1d.html#torch.nn.LazyConv1d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConv2d.html#torch.nn.LazyConv2d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConv3d.html#torch.nn.LazyConv3d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConvTranspose1d.html#torch.nn.LazyConvTranspose1d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConvTranspose2d.html#torch.nn.LazyConvTranspose2d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConvTranspose3d.html#torch.nn.LazyConvTranspose3d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxPool1d.html#torch.nn.MaxPool1d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxPool2d.html#torch.nn.MaxPool2d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxPool3d.html#torch.nn.MaxPool3d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxUnpool1d.html#torch.nn.MaxUnpool1d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxUnpool2d.html#torch.nn.MaxUnpool2d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxUnpool3d.html#torch.nn.MaxUnpool3d",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Linear.html#torch.nn.Linear",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyLinear.html#torch.nn.LazyLinear",
    },
    {
        apiName: "BatchNorm1d",
        extendCssClass: ["BatchNorm1d"],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "num_features", short: "NF" }],
        args: [
            {
                name: "num_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "None",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html",
    },
    {
        apiName: "BatchNorm2d",
        extendCssClass: ["BatchNorm2d"],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "num_features", short: "NF" }],
        args: [
            {
                name: "num_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "None",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d.html",
    },
    {
        apiName: "BatchNorm3d",
        extendCssClass: ["BatchNorm3d"],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "num_features", short: "NF" }],
        args: [
            {
                name: "num_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "None",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm3d.html",
    },
    {
        apiName: "GroupNorm",
        extendCssClass: ["GroupNorm"],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "num_groups", short: "NG" },
            { name: "num_channels", short: "NC" },
        ],
        args: [
            {
                name: "num_groups",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "num_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "3",
            },
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.GroupNorm.html#groupnorm",
    },
    {
        apiName: "LayerNorm",
        extendCssClass: ["LayerNorm"],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "normalized_shape", short: "S" }],
        args: [
            {
                name: "normalized_shape",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(3,64,64)",
            },
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "elementwise_affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html#layernorm",
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
operatorBarNamespace.apiName2operators = new Map();
for (const operator of operatorBarNamespace.operators) {
    operatorBarNamespace.apiName2operators.set(operator.apiName, operator);
}
// call(srcNode, tarNode, srcEndpointIdx, tarEndpointIdx)
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
