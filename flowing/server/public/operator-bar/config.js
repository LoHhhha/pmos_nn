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
    button: {
        element: "button",
        type: null,
    },
};

operatorBarNamespace.argsType = {
    strVar: {
        id: "identifier",
        reg: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value;
        },
        get note() {
            return I18N_STRINGS.str_var_note;
        },
        prompt: "identifier which starting with letter or underline and only containing letter, underline and number such as 'a1', '_var'",
    },
    strInt: {
        id: "integer",
        reg: /^[-+]?\d+$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseInt(value);
        },
        get note() {
            return I18N_STRINGS.str_int_note;
        },
        prompt: "integer such as '19528'",
    },
    strNotNegInt: {
        id: "nonnegative integer",
        reg: /^\s*\d+\s*$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            const ret = value.match(/\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            return ret[0];
        },
        get note() {
            return I18N_STRINGS.str_not_neg_int_note;
        },
        prompt: "nonnegative integer such as '19528'",
    },
    strIntOrNone: {
        id: "None or integer",
        reg: /^(([-+]?\d+)|(None))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            if (value === "None") return null;
            return parseInt(value);
        },
        get note() {
            return I18N_STRINGS.str_int_or_none_note;
        },
        prompt: "'None' or integer such as '19528'",
    },
    strFloat: {
        id: "float",
        reg: /^[-+]?\d+\.?\d*(e[-+]?\d+)?$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseFloat(value);
        },
        get note() {
            return I18N_STRINGS.str_float_note;
        },
        prompt: "float such as '19528', '-0.15' or '3.14e-2'",
    },
    strFloatOrNone: {
        id: "None or float",
        reg: /^(([-+]?\d+\.?\d*(e[-+]?\d+)?)|(None))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return parseFloat(value);
        },
        get note() {
            return I18N_STRINGS.str_float_or_none_note;
        },
        prompt: "'None' or float such as '19528', '-0.15' or '3.14e-2'",
    },
    strTuple: {
        id: "integer tuple",
        reg: /^\(\s*[-+]?\d+\s*(,\s*[-+]?\d+\s*)*\)$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
        },
        get note() {
            return I18N_STRINGS.str_tuple_note;
        },
        prompt: "tuple containing integers like string which divided by ',' and included by '(' and ')' such as '(-1,3,64,64)'",
    },
    strNotNegTuple: {
        id: "nonnegative integer tuple",
        reg: /^\(\s*\d+\s*(,\s*\d+\s*)*\)$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            return value.match(/\d+/g).map((item) => {
                return parseInt(item, 10);
            });
        },
        get note() {
            return I18N_STRINGS.str_not_neg_tuple_note;
        },
        prompt: "tuple containing nonnegative integers like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'",
    },
    strNotNegIntOrCanNoneNotNegTuple: {
        id: "nonnegative integer or nonnegative integer/None tuple",
        reg: /^((\d+)|(\(\s*((\d+)|None)\s*(,\s*((\d+)|None)\s*)*\)))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            const values = value.match(/(\d+)|None/g).map((item) => {
                if (item === "None") {
                    return null;
                }
                return parseInt(item, 10);
            });
            if (values.length === 1) {
                return values[0];
            }
            return values;
        },
        get note() {
            return I18N_STRINGS.str_not_neg_int_or_can_none_not_neg_tuple_note;
        },
        prompt: "nonnegative integers or tuple containing nonnegative integers/'None' like string which divided by ',' and included by '(' and ')' such as '(1,3,None,64)'",
    },
    strIntOrTuple: {
        id: "integer or integer tuple",
        reg: /^((\(\s*[-+]?\d+\s*(,\s*[-+]?\d+\s*)*\))|([-+]?\d+))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            const ret = value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            if (ret.length === 1) return ret[0];
            return ret;
        },
        get note() {
            return I18N_STRINGS.str_int_or_tuple_note;
        },
        prompt: "integer or tuple containing integers like string which divided by ',' and included by '(' and ')' such as '(-1,3,64,64)'",
    },
    strNotNegIntOrNotNegTuple: {
        id: "nonnegative integer or nonnegative integer tuple",
        reg: /^((\(\s*\d+\s*(,\s*\d+\s*)*\))|(\s*\d+\s*))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            const ret = value.match(/\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            if (ret.length === 1) return ret[0];
            return ret;
        },
        get note() {
            return I18N_STRINGS.str_not_neg_int_or_not_neg_tuple;
        },
        prompt: "nonnegative integer or tuple containing nonnegative integers like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'",
    },
    strIntOrTupleOrNone: {
        id: "None or integer or integer tuple",
        reg: /^((\(\s*[-+]?\d+\s*(,\s*[-+]?\d+\s*)*\))|([-+]?\d+)|(None))$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            if (value === "None") return null;
            const ret = value.match(/[-+]?\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            if (ret.length === 1) return ret[0];
            return ret;
        },
        get note() {
            return I18N_STRINGS.str_int_or_tuple_or_none_note;
        },
        prompt: "'None', integer or tuple containing integers like string which divided by ',' and included by '(' and ')' such as '(-1,3,64,64)'",
    },
    bool: {
        id: "boolean",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            return value === "True";
        },
        values: ["False", "True"],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.bool.values.join(
                ", "
            )}`;
        },
    },
    boolOrNone: {
        id: "boolean or None",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            if (value === "None") {
                return null;
            }
            return value === "True";
        },
        values: ["False", "True", "None"],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.boolOrNone.values.join(
                ", "
            )}`;
        },
    },
    pytorchPadding: {
        id: "pytorch padding for convolution",
        reg: /^((\(\s*\d+\s*(,\s*\d+\s*)*\))|(\s*\d+\s*))|valid|same$/,
        input: operatorBarNamespace.argsInputType.text,
        getValue: (value) => {
            if (value === "valid" || value === "same") {
                return value;
            }

            const ret = value.match(/\d+/g).map((item) => {
                return parseInt(item, 10);
            });
            if (ret.length === 1) return ret[0];
            return ret;
        },
        get note() {
            return I18N_STRINGS.pytorch_padding_note;
        },
        prompt: "'valid' or 'same' or nonnegative integer or tuple containing nonnegative integers like string which divided by ',' and included by '(' and ')' such as '(1,3,64,64)'",
    },
    pytorchPaddingMode: {
        id: "pytorch padding mode",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            return value;
        },
        values: ["zeros", "reflect", "replicate", "circular"],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.pytorchPaddingMode.values.join(
                ", "
            )}`;
        },
    },
    pytorchApproximate: {
        id: "pytorch approximate",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            return value;
        },
        values: ["none", "tanh"],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.pytorchApproximate.values.join(
                ", "
            )}`;
        },
    },
    pytorchDevice: {
        id: "pytorch device",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            if (value === "default") return null;
            return value;
        },
        values: ["default", "cpu", "cuda", "mps", "xpu", "xla", "mate"],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.pytorchDevice.values.join(
                ", "
            )}`;
        },
    },
    pytorchDataType: {
        id: "pytorch data type",
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
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.pytorchDataType.values.join(
                ", "
            )}`;
        },
    },
    mindsporeDataType: {
        id: "mindspore data type",
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
            "uint16",
            "uint32",
            "uint64",
            "int8",
            "int16",
            "int32",
            "int64",
            "complex64",
            "complex128",
        ],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.mindsporeDataType.values.join(
                ", "
            )}`;
        },
    },
    mindsporePadMode: {
        id: "mindspore pad mode",
        input: operatorBarNamespace.argsInputType.select,
        getValue: (value) => {
            return value;
        },
        values: ["same", "valid", "pad"],
        get prompt() {
            return `one of ${operatorBarNamespace.argsType.mindsporePadMode.values.join(
                ", "
            )}`;
        },
    },
    sequential: {
        id: "sequential",
        typeCls: Array,
        input: operatorBarNamespace.argsInputType.button,
        getValue: (value) => {
            const result = [];
            for (const { apiName, content } of value) {
                const config =
                    operatorBarNamespace.apiName2operators.getOperator(
                        MEMORY_GET(
                            MEMORY_KEYS.CurrentFramework,
                            FRAMEWORK.pytorch
                        ),
                        apiName
                    );

                const vContent = {};
                for (const arg of config.args) {
                    vContent[arg.name] = arg.type.getValue(content[arg.name]);
                }
                result.push({
                    apiName,
                    content: vContent,
                });
            }
            return result;
        },
        get textContent() {
            return I18N_STRINGS.modify;
        },
        callback: (event, node) => {
            const wicket = new Wicket();
            wicket.show(
                `${node.config.apiName} #${node.id}`,
                node.content["modules"],
                () => {
                    node.content["modules"] = JSON.parse(
                        JSON.stringify(wicket.getNodesInfo())
                    );
                    MESSAGE_PUSH(MESSAGE_TYPE.GraphChanged);
                }
            );
            MESSAGE_CALL(MESSAGE_TYPE.ShowCanvasMask, {
                closeWhenClick: true,
                beforeClose: () => {
                    wicket.hide();
                    node.update();
                },
            });
        },
        prompt: "using JSON format like '[{apiName:node_api_name,content:{param:value,...}},...]' to describe a series of nodes",
    },
};

operatorBarNamespace.argsValueCheck = (type, value) => {
    if (type.reg) {
        return type.reg.test(value);
    }
    if (type.typeCls) {
        return value instanceof type.typeCls;
    }
    return type.values.includes(value);
};

operatorBarNamespace.framework = {
    all: "all",
    pytorch: FRAMEWORK.pytorch,
    mindspore: FRAMEWORK.mindspore,
    tensorflow: FRAMEWORK.tensorflow,
};

operatorBarNamespace.typeCode = {
    IO: 0,
    math: 1,
    data: 2,
    block: 3,
    transform: 4,
    activation: 5,
    drop: 6,
    convolution: 7,
    pool: 8,
    linear: 9,
    normalization: 10,
};

operatorBarNamespace.typeInfo = {};
for (const key in operatorBarNamespace.typeCode) {
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    operatorBarNamespace.typeInfo[operatorBarNamespace.typeCode[key]] = {
        name: name,
        key: key,
        code: operatorBarNamespace.typeCode[key],
    };
}

// [r, g, b, diff_r, diff_g, diff_b]
operatorBarNamespace.typeColorInfo = {
    IO: [0, 0, 0, 0, 0, 0], // manual
    math: [60, 120, 140, -4, -3, 5],
    data: [88, 148, 116, -3, -5, 4],
    block: [90, 110, 140, -4, -3, 5],
    transform: [160, 120, 180, -5, 2, 4],
    activation: [200, 100, 90, -2, -1, 1],
    drop: [180, 140, 80, -4, -4, 4],
    convolution: [80, 160, 200, 3, -5, 4],
    pool: [120, 180, 140, -3, -6, 3],
    linear: [200, 180, 60, -5, -4, 4],
    normalization: [170, 120, 160, -4, -3, 5],
};

operatorBarNamespace.outlinesGetter = {
    length: (value) => value.length,
    default: (value) => value,
};

/**
 * operator(
 *      apiName:String
 *      extendCssClass:Array<String>
 *      backgroundColor:String (auto padding if null)
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
    // begin, framework: all
    {
        apiName: "Input",
        extendCssClass: [],
        backgroundColor: "rgb(192, 128, 0)",
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
        extendCssClass: [],
        backgroundColor: "rgb(0, 128, 192)",
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
        extendCssClass: [],
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
        extendCssClass: [],
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
        extendCssClass: [],
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
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.math,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    {
        apiName: "Slice",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "start",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "0",
            },
            {
                name: "end",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.all,
        link: null,
    },
    // end, framework: all
    // begin, framework: PyTorch
    {
        apiName: "Rand",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.rand.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "RandNormal",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.randn.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "RandInt",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.randint.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Ones",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.ones.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Zeros",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.zeros.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Full",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.full.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Parameter",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "data_size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://docs.pytorch.org/docs/stable/generated/torch.nn.parameter.Parameter.html",
        outputShapeComeFromArg: "data_size",
    },
    {
        apiName: "Sequential",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.block,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            {
                name: "modules",
                short: "M",
                getter: operatorBarNamespace.outlinesGetter.length,
            },
        ],
        args: [
            {
                name: "modules",
                type: operatorBarNamespace.argsType.sequential,
                default: [],
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Sequential.html",
    },
    {
        apiName: "Reshape",
        extendCssClass: [],
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
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Flatten.html",
        canBeSequential: true,
    },
    {
        apiName: "Unflatten",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Unflatten.html",
        canBeSequential: true,
    },
    {
        apiName: "Cat",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.cat.html",
    },
    {
        apiName: "Stack",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.stack.html",
    },
    {
        apiName: "Squeeze",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.squeeze.html",
    },
    {
        apiName: "Unsqueeze",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.unsqueeze.html",
    },
    {
        apiName: "Permute",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.permute.html",
    },
    {
        apiName: "Transpose",
        extendCssClass: [],
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
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.rand_like.html",
    },
    {
        apiName: "RandNormalLike",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.randn_like.html",
    },
    {
        apiName: "RandIntLike",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.randint_like.html",
    },
    {
        apiName: "OnesLike",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.ones_like.html",
    },
    {
        apiName: "ZerosLike",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.zeros_like.html",
    },
    {
        apiName: "FullLike",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.full_like.html",
    },
    {
        apiName: "Dropout",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout.html",
        canBeSequential: true,
    },
    {
        apiName: "Dropout1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout1d.html",
        canBeSequential: true,
    },
    {
        apiName: "Dropout2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout2d.html",
        canBeSequential: true,
    },
    {
        apiName: "Dropout3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout3d.html",
        canBeSequential: true,
    },
    {
        apiName: "AlphaDropout",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AlphaDropout.html",
        canBeSequential: true,
    },
    {
        apiName: "FeatureAlphaDropout",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.FeatureAlphaDropout.html",
        canBeSequential: true,
    },
    {
        apiName: "Identity",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Identity.html",
        canBeSequential: true,
    },
    {
        apiName: "ReLU",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ReLU.html",
        canBeSequential: true,
    },
    {
        apiName: "LeakyReLU",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LeakyReLU.html",
        canBeSequential: true,
    },
    {
        apiName: "SELU",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.SELU.html",
        canBeSequential: true,
    },
    {
        apiName: "CELU",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.CELU.html",
        canBeSequential: true,
    },
    {
        apiName: "Sigmoid",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Sigmoid.html",
        canBeSequential: true,
    },
    {
        apiName: "Softmax",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softmax.html",
        canBeSequential: true,
    },
    {
        apiName: "PReLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "num_parameters", short: "N" }],
        args: [
            {
                name: "num_parameters",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "init",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.25",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.PReLU.html",
        canBeSequential: true,
    },
    {
        apiName: "GELU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "approximate",
                type: operatorBarNamespace.argsType.pytorchApproximate,
                default: "none",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.GELU.html",
        canBeSequential: true,
    },
    {
        apiName: "LogSigmoid",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LogSigmoid.html",
        canBeSequential: true,
    },
    {
        apiName: "Softplus",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "beta", short: "B" },
            { name: "threshold", short: "T" },
        ],
        args: [
            {
                name: "beta",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1",
            },
            {
                name: "threshold",
                type: operatorBarNamespace.argsType.strFloat,
                default: "20",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softplus.html",
        canBeSequential: true,
    },
    {
        apiName: "Tanh",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Tanh.html",
        canBeSequential: true,
    },
    {
        apiName: "Tanhshrink",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Tanhshrink.html",
        canBeSequential: true,
    },
    {
        apiName: "Mish",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Mish.html",
        canBeSequential: true,
    },
    {
        apiName: "GLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "dim", short: "D" }],
        args: [
            {
                name: "dim",
                type: operatorBarNamespace.argsType.strInt,
                default: "-1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.GLU.html",
        canBeSequential: true,
    },
    {
        apiName: "Softsign",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softsign.html",
        canBeSequential: true,
    },
    {
        apiName: "Softmax2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softmax2d.html",
        canBeSequential: true,
    },
    {
        apiName: "ELU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "alpha",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ELU.html",
        canBeSequential: true,
    },
    {
        apiName: "Threshold",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "threshold", short: "T" },
            { name: "value", short: "V" },
        ],
        args: [
            {
                name: "threshold",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0",
            },
            {
                name: "value",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Threshold.html",
        canBeSequential: true,
    },
    {
        apiName: "ReLU6",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ReLU6.html",
        canBeSequential: true,
    },
    {
        apiName: "Hardsigmoid",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Hardsigmoid.html",
        canBeSequential: true,
    },
    {
        apiName: "Hardtanh",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "min_val", short: "Mi" },
            { name: "max_val", short: "Mx" },
        ],
        args: [
            {
                name: "min_val",
                type: operatorBarNamespace.argsType.strFloat,
                default: "-1",
            },
            {
                name: "max_val",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1",
            },
            {
                name: "inplace",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Hardtanh.html",
        canBeSequential: true,
    },
    {
        apiName: "Hardswish",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Hardswish.html",
        canBeSequential: true,
    },
    {
        apiName: "SiLU",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.SiLU.html",
        canBeSequential: true,
    },
    {
        apiName: "LogSoftmax",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LogSoftmax.html",
        canBeSequential: true,
    },
    {
        apiName: "Softmin",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softmin.html",
        canBeSequential: true,
    },
    {
        apiName: "Softshrink",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "lambd", short: "L" }],
        args: [
            {
                name: "lambd",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Softshrink.html",
        canBeSequential: true,
    },
    {
        apiName: "Hardshrink",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "lambd", short: "L" }],
        args: [
            {
                name: "lambd",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Hardshrink.html",
        canBeSequential: true,
    },
    {
        apiName: "Conv1d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.pytorchPadding,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Conv1d.html",
        canBeSequential: true,
    },
    {
        apiName: "Conv2d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.pytorchPadding,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html",
        canBeSequential: true,
    },
    {
        apiName: "Conv3d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.pytorchPadding,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Conv3d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyConv1d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.pytorchPadding,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConv1d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyConv2d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.pytorchPadding,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConv2d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyConv3d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.pytorchPadding,
                default: "0",
            },
            {
                name: "padding_mode",
                type: operatorBarNamespace.argsType.pytorchPaddingMode,
                default: "zeros",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConv3d.html",
        canBeSequential: true,
    },
    {
        apiName: "ConvTranspose1d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose1d.html",
        canBeSequential: true,
    },
    {
        apiName: "ConvTranspose2d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose2d.html",
        canBeSequential: true,
    },
    {
        apiName: "ConvTranspose3d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose3d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyConvTranspose1d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConvTranspose1d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyConvTranspose2d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConvTranspose2d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyConvTranspose3d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "groups",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyConvTranspose3d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxPool1d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxPool1d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxPool2d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxPool2d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxPool3d",
        extendCssClass: [],
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
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxPool3d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AdaptiveMaxPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "output_size", short: "O" },
            { name: "return_indices", short: "I" },
        ],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType
                    .strNotNegIntOrCanNoneNotNegTuple,
                default: "(32)",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AdaptiveMaxPool1d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AdaptiveMaxPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "output_size", short: "O" },
            { name: "return_indices", short: "I" },
        ],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType
                    .strNotNegIntOrCanNoneNotNegTuple,
                default: "(32,32)",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AdaptiveMaxPool2d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AdaptiveMaxPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "output_size", short: "O" },
            { name: "return_indices", short: "I" },
        ],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType
                    .strNotNegIntOrCanNoneNotNegTuple,
                default: "(32,32,32)",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AdaptiveMaxPool3d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AdaptiveAvgPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType
                    .strNotNegIntOrCanNoneNotNegTuple,
                default: "(32)",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AdaptiveAvgPool1d.html",
        canBeSequential: true,
    },
    {
        apiName: "AdaptiveAvgPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType
                    .strNotNegIntOrCanNoneNotNegTuple,
                default: "(32,32)",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AdaptiveAvgPool2d.html",
        canBeSequential: true,
    },
    {
        apiName: "AdaptiveAvgPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType
                    .strNotNegIntOrCanNoneNotNegTuple,
                default: "(32,32,32)",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AdaptiveAvgPool3d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxUnpool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxUnpool1d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxUnpool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxUnpool2d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxUnpool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.MaxUnpool3d.html",
        canBeSequential: true,
    },
    {
        apiName: "AvgPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "count_include_pad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AvgPool1d.html",
        canBeSequential: true,
    },
    {
        apiName: "AvgPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "count_include_pad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AvgPool2d.html",
        canBeSequential: true,
    },
    {
        apiName: "AvgPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "count_include_pad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.AvgPool3d.html",
        canBeSequential: true,
    },
    {
        apiName: "Linear",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Linear.html",
        canBeSequential: true,
    },
    {
        apiName: "LayerLinear",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyLinear.html",
        canBeSequential: true,
    },
    {
        apiName: "Bilinear",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.linear,
        inputEnd: ["input1", "input2"],
        outputEnd: ["output"],
        outlines: [
            { name: "in1_features", short: "I1" },
            { name: "in2_features", short: "I2" },
            { name: "out_features", short: "O" },
        ],
        args: [
            {
                name: "in1_features",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "in2_features",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.Bilinear.html",
        canBeSequential: true,
    },
    {
        apiName: "BatchNorm1d",
        extendCssClass: [],
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
                default: "0.1",
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
        canBeSequential: true,
    },
    {
        apiName: "BatchNorm2d",
        extendCssClass: [],
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
                default: "0.1",
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
        canBeSequential: true,
    },
    {
        apiName: "BatchNorm3d",
        extendCssClass: [],
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
                default: "0.1",
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
        canBeSequential: true,
    },
    {
        apiName: "LazyBatchNorm1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "0.1",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyBatchNorm1d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyBatchNorm2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "0.1",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyBatchNorm2d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyBatchNorm3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "0.1",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyBatchNorm3d.html",
        canBeSequential: true,
    },
    {
        apiName: "InstanceNorm1d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.InstanceNorm1d.html",
        canBeSequential: true,
    },
    {
        apiName: "InstanceNorm2d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.InstanceNorm2d.html",
        canBeSequential: true,
    },
    {
        apiName: "InstanceNorm3d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.InstanceNorm3d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyInstanceNorm1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyInstanceNorm1d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyInstanceNorm2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyInstanceNorm2d.html",
        canBeSequential: true,
    },
    {
        apiName: "LazyInstanceNorm3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "eps",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-5",
            },
            {
                name: "momentum",
                type: operatorBarNamespace.argsType.strFloatOrNone,
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "track_running_stats",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.pytorch,
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LazyInstanceNorm3d.html",
        canBeSequential: true,
    },
    {
        apiName: "GroupNorm",
        extendCssClass: [],
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.GroupNorm.html",
        canBeSequential: true,
    },
    {
        apiName: "LayerNorm",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "normalized_shape", short: "S" }],
        args: [
            {
                name: "normalized_shape",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "768",
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
        link: "https://pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html",
        canBeSequential: true,
    },
    // end, framework: PyTorch
    // begin, framework: MindSpore
    {
        apiName: "Rand",
        extendCssClass: [],
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
                name: "seed",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.rand.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "RandNormal",
        extendCssClass: [],
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
                name: "seed",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.randn.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "RandInt",
        extendCssClass: [],
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
                name: "seed",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.randint.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Zeros",
        extendCssClass: [],
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
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.zeros.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Ones",
        extendCssClass: [],
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
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.ones.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "Full",
        extendCssClass: [],
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
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.full.html",
        outputShapeComeFromArg: "size",
    },
    {
        apiName: "SequentialCell",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.block,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            {
                name: "modules",
                short: "M",
                getter: operatorBarNamespace.outlinesGetter.length,
            },
        ],
        args: [
            {
                name: "modules",
                type: operatorBarNamespace.argsType.sequential,
                default: [],
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/zh-CN/master/api_python/nn/mindspore.nn.SequentialCell.html",
    },
    {
        apiName: "Cat",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.cat.html",
    },
    {
        apiName: "Stack",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input_0", "input_1"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.stack.html",
    },
    {
        apiName: "Flatten",
        extendCssClass: [],
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Flatten.html",
        canBeSequential: true,
    },
    {
        apiName: "Unflatten",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "axis", short: "A" },
            { name: "unflattened_size", short: "T" },
        ],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "unflattened_size",
                type: operatorBarNamespace.argsType.strTuple,
                default: "(16,16)",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Unflatten.html",
        canBeSequential: true,
    },
    {
        apiName: "Permute",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strTuple,
                default: "(2,1,0)",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.permute.html",
    },
    {
        apiName: "Reshape",
        extendCssClass: [],
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.reshape.html",
    },
    {
        apiName: "Squeeze",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.squeeze.html",
    },
    {
        apiName: "Unsqueeze",
        extendCssClass: [],
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.unsqueeze.html",
    },
    {
        apiName: "RandLike",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "seed",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.rand_like.html",
    },
    {
        apiName: "RandNormalLike",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "seed",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.randn_like.html",
    },
    {
        apiName: "RandIntLike",
        extendCssClass: [],
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
                name: "seed",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.randint_like.html",
    },
    {
        apiName: "OnesLike",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.ones_like.html",
    },
    {
        apiName: "ZerosLike",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.transform,
        inputEnd: ["input"],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.zeros_like.html",
    },
    {
        apiName: "FullLike",
        extendCssClass: [],
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
                name: "dtype",
                type: operatorBarNamespace.argsType.mindsporeDataType,
                default: "default",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/ops/mindspore.ops.full_like.html",
    },
    {
        apiName: "Parameter",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.data,
        inputEnd: [],
        outputEnd: ["data"],
        outlines: [],
        args: [
            {
                name: "data_size",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(16,16)",
            },
            {
                name: "requires_grad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "layerwise_parallel",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "parallel_optimizer",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/mindspore/mindspore.Parameter.html",
        outputShapeComeFromArg: "data_size",
    },
    {
        apiName: "Identity",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Identity.html#mindspore.nn.Identity",
        canBeSequential: true,
    },
    {
        apiName: "CELU",
        extendCssClass: [],
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
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.CELU.html#mindspore.nn.CELU",
        canBeSequential: true,
    },
    {
        apiName: "ELU",
        extendCssClass: [],
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
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.ELU.html#mindspore.nn.ELU",
        canBeSequential: true,
    },
    {
        apiName: "FastGelu",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.FastGelu.html#mindspore.nn.FastGelu",
        canBeSequential: true,
    },
    {
        apiName: "GELU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "approximate",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.GELU.html#mindspore.nn.GELU",
        canBeSequential: true,
    },
    {
        apiName: "GLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "-1",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.GLU.html#mindspore.nn.GLU",
        canBeSequential: true,
    },
    {
        apiName: "Hardtanh",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "min_val", short: "Mi" },
            { name: "max_val", short: "Mx" },
        ],
        args: [
            {
                name: "min_val",
                type: operatorBarNamespace.argsType.strFloat,
                default: "-1.0",
            },
            {
                name: "max_val",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1.0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Hardtanh.html#mindspore.nn.Hardtanh",
        canBeSequential: true,
    },
    {
        apiName: "HShrink",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "lambd", short: "L" }],
        args: [
            {
                name: "lambd",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.HShrink.html#mindspore.nn.HShrink",
        canBeSequential: true,
    },
    {
        apiName: "HSigmoid",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.HSigmoid.html#mindspore.nn.HSigmoid",
        canBeSequential: true,
    },
    {
        apiName: "HSwish",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.HSwish.html#mindspore.nn.HSwish",
        canBeSequential: true,
    },
    {
        apiName: "LeakyReLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "alpha",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.2",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.LeakyReLU.html#mindspore.nn.LeakyReLU",
        canBeSequential: true,
    },
    {
        apiName: "LogSigmoid",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.LogSigmoid.html#mindspore.nn.LogSigmoid",
        canBeSequential: true,
    },
    {
        apiName: "LogSoftmax",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "-1",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.LogSoftmax.html#mindspore.nn.LogSoftmax",
        canBeSequential: true,
    },
    {
        apiName: "Mish",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Mish.html#mindspore.nn.Mish",
        canBeSequential: true,
    },
    {
        apiName: "Softsign",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Softsign.html#mindspore.nn.Softsign",
        canBeSequential: true,
    },
    {
        apiName: "PReLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "channel", short: "C" }],
        args: [
            {
                name: "channel",
                type: operatorBarNamespace.argsType.strInt,
                default: "1",
            },
            {
                name: "w",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.25",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.PReLU.html#mindspore.nn.PReLU",
        canBeSequential: true,
    },
    {
        apiName: "ReLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.ReLU.html#mindspore.nn.ReLU",
        canBeSequential: true,
    },
    {
        apiName: "ReLU6",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.ReLU6.html#mindspore.nn.ReLU6",
        canBeSequential: true,
    },
    {
        apiName: "RReLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [
            {
                name: "lower",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.125",
            },
            {
                name: "upper",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.333333",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.RReLU.html#mindspore.nn.RReLU",
        canBeSequential: true,
    },
    {
        apiName: "SeLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.SeLU.html#mindspore.nn.SeLU",
        canBeSequential: true,
    },
    {
        apiName: "SiLU",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.SiLU.html#mindspore.nn.SiLU",
        canBeSequential: true,
    },
    {
        apiName: "Sigmoid",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Sigmoid.html#mindspore.nn.Sigmoid",
        canBeSequential: true,
    },
    {
        apiName: "Softmin",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "-1",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Softmin.html#mindspore.nn.Softmin",
        canBeSequential: true,
    },
    {
        apiName: "Softmax",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "axis", short: "A" }],
        args: [
            {
                name: "axis",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "-1",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Softmax.html#mindspore.nn.Softmax",
        canBeSequential: true,
    },
    {
        apiName: "Softmax2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Softmax2d.html#mindspore.nn.Softmax2d",
        canBeSequential: true,
    },
    {
        apiName: "SoftShrink",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "lambd", short: "L" }],
        args: [
            {
                name: "lambd",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.SoftShrink.html#mindspore.nn.SoftShrink",
        canBeSequential: true,
    },
    {
        apiName: "Tanh",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Tanh.html#mindspore.nn.Tanh",
        canBeSequential: true,
    },
    {
        apiName: "Tanhshrink",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [],
        args: [],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Tanhshrink.html#mindspore.nn.Tanhshrink",
        canBeSequential: true,
    },
    {
        apiName: "Threshold",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.activation,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "threshold", short: "T" },
            { name: "value", short: "V" },
        ],
        args: [
            {
                name: "threshold",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0",
            },
            {
                name: "value",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Threshold.html#mindspore.nn.Threshold",
        canBeSequential: true,
    },
    {
        apiName: "Conv1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "pad_mode", short: "PM" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "same",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "group",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Conv1d.html#mindspore.nn.Conv1d",
        canBeSequential: true,
    },
    {
        apiName: "Conv2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "pad_mode", short: "PM" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "same",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "group",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Conv2d.html#mindspore.nn.Conv2d",
        canBeSequential: true,
    },
    {
        apiName: "Conv3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "pad_mode", short: "PM" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "same",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "group",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Conv3d.html#mindspore.nn.Conv3d",
        canBeSequential: true,
    },
    {
        apiName: "Conv1dTranspose",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "pad_mode", short: "PM" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "same",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "group",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Conv1dTranspose.html#mindspore.nn.Conv1dTranspose",
        canBeSequential: true,
    },
    {
        apiName: "Conv2dTranspose",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "pad_mode", short: "PM" },
            { name: "output_padding", short: "OP" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "same",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "group",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Conv2dTranspose.html#mindspore.nn.Conv2dTranspose",
        canBeSequential: true,
    },
    {
        apiName: "Conv3dTranspose",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.convolution,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
            { name: "pad_mode", short: "PM" },
            { name: "output_padding", short: "OP" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "3",
            },
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "3",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "same",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "output_padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "group",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Conv3dTranspose.html#mindspore.nn.Conv3dTranspose",
        canBeSequential: true,
    },
    {
        apiName: "Dropout",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Dropout.html",
        canBeSequential: true,
    },
    {
        apiName: "Dropout1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Dropout1d.html",
        canBeSequential: true,
    },
    {
        apiName: "Dropout2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Dropout2d.html",
        canBeSequential: true,
    },
    {
        apiName: "Dropout3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.drop,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "p", short: "P" }],
        args: [
            {
                name: "p",
                type: operatorBarNamespace.argsType.strFloat,
                default: "0.5",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Dropout3d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "return_indices", short: "I" },
            { name: "pad_mode", short: "PM" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "valid",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.MaxPool1d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "return_indices", short: "I" },
            { name: "pad_mode", short: "PM" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "valid",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.MaxPool2d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "return_indices", short: "I" },
            { name: "pad_mode", short: "PM" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "valid",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "dilation",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.MaxPool3d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AvgPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "pad_mode", short: "PM" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "valid",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "count_include_pad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AvgPool1d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AvgPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "pad_mode", short: "PM" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "valid",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "count_include_pad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "divisor_override",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AvgPool2d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AvgPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "pad_mode", short: "PM" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "1",
            },
            {
                name: "pad_mode",
                type: operatorBarNamespace.argsType.mindsporePadMode,
                default: "valid",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
            {
                name: "ceil_mode",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
            {
                name: "count_include_pad",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "divisor_override",
                type: operatorBarNamespace.argsType.strIntOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AvgPool3d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AdaptiveAvgPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "32",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AdaptiveAvgPool1d.html",
        canBeSequential: true,
    },
    {
        apiName: "AdaptiveAvgPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "32",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AdaptiveAvgPool2d.html",
        canBeSequential: true,
    },
    {
        apiName: "AdaptiveAvgPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "32",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AdaptiveAvgPool3d.html",
        canBeSequential: true,
    },
    {
        apiName: "AdaptiveMaxPool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "output_size", short: "O" }],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType.strNotNegInt,
                default: "32",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AdaptiveMaxPool1d.html",
        canBeSequential: true,
    },
    {
        apiName: "AdaptiveMaxPool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "output_size", short: "O" },
            { name: "return_indices", short: "I" },
        ],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "32",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AdaptiveMaxPool2d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "AdaptiveMaxPool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input"],
        outputEnd: ["output", "indices"],
        outlines: [
            { name: "output_size", short: "O" },
            { name: "return_indices", short: "I" },
        ],
        args: [
            {
                name: "output_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "32",
            },
            {
                name: "return_indices",
                type: operatorBarNamespace.argsType.bool,
                default: "False",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.AdaptiveMaxPool3d.html",
        canBeSequential: true,
        changeCallBack: (node) => {
            if (
                !operatorBarNamespace.argsType.bool.getValue(
                    node.content["return_indices"]
                )
            ) {
                const indicesEndpoint = node.outputEndpoint[1];
                const connections = indicesEndpoint.connections;
                for (let ptr = connections.length - 1; ptr >= 0; ptr--) {
                    Node.jsPlumbInstance.deleteConnection(connections[ptr]);
                }
            }
        },
    },
    {
        apiName: "MaxUnpool1d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.MaxUnpool1d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxUnpool2d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.MaxUnpool2d.html",
        canBeSequential: true,
    },
    {
        apiName: "MaxUnpool3d",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.pool,
        inputEnd: ["input", "indices"],
        outputEnd: ["output"],
        outlines: [
            { name: "kernel_size", short: "K" },
            { name: "stride", short: "S" },
            { name: "padding", short: "P" },
        ],
        args: [
            {
                name: "kernel_size",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "2",
            },
            {
                name: "stride",
                type: operatorBarNamespace.argsType.strIntOrTupleOrNone,
                default: "None",
            },
            {
                name: "padding",
                type: operatorBarNamespace.argsType.strNotNegIntOrNotNegTuple,
                default: "0",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.MaxUnpool3d.html",
        canBeSequential: true,
    },
    {
        apiName: "Dense",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.linear,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [
            { name: "in_channels", short: "I" },
            { name: "out_channels", short: "O" },
        ],
        args: [
            {
                name: "in_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.Dense.html",
        canBeSequential: true,
    },
    {
        apiName: "BiDense",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.linear,
        inputEnd: ["input1", "input2"],
        outputEnd: ["output"],
        outlines: [
            { name: "in1_channels", short: "I1" },
            { name: "in2_channels", short: "I2" },
            { name: "out_channels", short: "O" },
        ],
        args: [
            {
                name: "in1_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "in2_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "out_channels",
                type: operatorBarNamespace.argsType.strInt,
                default: "64",
            },
            {
                name: "has_bias",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.BiDense.html",
        canBeSequential: true,
    },
    {
        apiName: "BatchNorm1d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "use_batch_statistics",
                type: operatorBarNamespace.argsType.boolOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.BatchNorm1d.html",
        canBeSequential: true,
    },
    {
        apiName: "BatchNorm2d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "use_batch_statistics",
                type: operatorBarNamespace.argsType.boolOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.BatchNorm2d.html",
        canBeSequential: true,
    },
    {
        apiName: "BatchNorm3d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
            {
                name: "use_batch_statistics",
                type: operatorBarNamespace.argsType.boolOrNone,
                default: "None",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.BatchNorm3d.html",
        canBeSequential: true,
    },
    {
        apiName: "InstanceNorm1d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.InstanceNorm1d.html",
        canBeSequential: true,
    },
    {
        apiName: "InstanceNorm2d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.InstanceNorm2d.html",
        canBeSequential: true,
    },
    {
        apiName: "InstanceNorm3d",
        extendCssClass: [],
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
                default: "0.1",
            },
            {
                name: "affine",
                type: operatorBarNamespace.argsType.bool,
                default: "True",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.InstanceNorm3d.html",
        canBeSequential: true,
    },
    {
        apiName: "LayerNorm",
        extendCssClass: [],
        typeCode: operatorBarNamespace.typeCode.normalization,
        inputEnd: ["input"],
        outputEnd: ["output"],
        outlines: [{ name: "normalized_shape", short: "NS" }],
        args: [
            {
                name: "normalized_shape",
                type: operatorBarNamespace.argsType.strNotNegTuple,
                default: "(64,64)",
            },
            {
                name: "begin_norm_axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "-1",
            },
            {
                name: "begin_params_axis",
                type: operatorBarNamespace.argsType.strInt,
                default: "-1",
            },
            {
                name: "epsilon",
                type: operatorBarNamespace.argsType.strFloat,
                default: "1e-7",
            },
        ],
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.LayerNorm.html",
        canBeSequential: true,
    },
    {
        apiName: "GroupNorm",
        extendCssClass: [],
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
        framework: operatorBarNamespace.framework.mindspore,
        link: "https://www.mindspore.cn/docs/en/master/api_python/nn/mindspore.nn.GroupNorm.html",
        canBeSequential: true,
    },
    // end, framework: MindSpore
];

operatorBarNamespace.operators.sort(function (a, b) {
    if (a.typeCode !== b.typeCode) return a.typeCode < b.typeCode ? -1 : 1;
    // framework:all will be the first
    if (a.framework !== b.framework)
        return a.framework.toLowerCase() < b.framework.toLowerCase() ? -1 : 1;
    if (a.apiName !== b.apiName) return a.apiName < b.apiName ? -1 : 1;
    return 0;
});

// set backColor
{
    let colors = {};
    let preTypeCode = -1;
    let preFramework = "";
    let r, g, b;
    let diffR, diffG, diffB;
    for (const operator of operatorBarNamespace.operators) {
        if (operator.backgroundColor !== undefined) continue;
        if (operator.typeCode !== preTypeCode) {
            const operatorType =
                operatorBarNamespace.typeInfo[operator.typeCode];
            [r, g, b, diffR, diffG, diffB] =
                operatorBarNamespace.typeColorInfo[operatorType.key];
            for (const [_, framework] of Object.entries(
                operatorBarNamespace.framework
            )) {
                colors[framework] = [r, g, b];
            }
            preTypeCode = operator.typeCode;
        }
        const framework = operator.framework;
        if (framework !== preFramework) {
            [r, g, b] = colors[operatorBarNamespace.framework.all];
            colors[framework] = [r, g, b];
            preFramework = framework;
        }
        operator.backgroundColor = `rgb(${colors[framework][0]}, ${colors[framework][1]}, ${colors[framework][2]})`;
        colors[framework][0] += diffR;
        colors[framework][1] += diffG;
        colors[framework][2] += diffB;
    }
}

// apiName2operators: {ApiName(str):operators([])}
operatorBarNamespace.apiName2operators = new Map();
for (const operator of operatorBarNamespace.operators) {
    if (!operatorBarNamespace.apiName2operators.has(operator.apiName)) {
        operatorBarNamespace.apiName2operators.set(operator.apiName, []);
    }
    operatorBarNamespace.apiName2operators.get(operator.apiName).push(operator);
}
operatorBarNamespace.apiName2operators.getOperator = (framework, apiName) => {
    const operators = operatorBarNamespace.apiName2operators.get(apiName, null);
    if (operators === null) {
        return undefined;
    }
    for (const operator of operators) {
        if (
            operator.framework === operatorBarNamespace.framework.all ||
            operator.framework === framework
        ) {
            return operator;
        }
    }
    return undefined;
};

// call(srcNode, tarNode, srcEndpointIdx, tarEndpointIdx)
operatorBarNamespace.connectionRule = [
    {
        name: "SelfNotSelf",
        get tip() {
            return I18N_STRINGS.self_not_self_tip;
        },
        check: (srcNode, tarNode) => {
            return srcNode.id === tarNode.id;
        },
    },
    {
        name: "InputNotOutput",
        get tip() {
            return I18N_STRINGS.input_not_output;
        },
        check: (srcNode, tarNode) => {
            return (
                srcNode.config.apiName === "Input" &&
                tarNode.config.apiName === "Output"
            );
        },
    },
    {
        name: "MaxPoolIndices",
        get tip() {
            return I18N_STRINGS.max_pool_indices;
        },
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
