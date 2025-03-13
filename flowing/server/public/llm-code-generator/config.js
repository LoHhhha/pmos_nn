const LLMCodeGeneratorNamespace = {};

LLMCodeGeneratorNamespace.blockReg = /(?<=```json\n)[^]*?(?=\n```)/gi;

LLMCodeGeneratorNamespace.baseUrlsDatalistInfo = {
    id: "llm-code-generator-base-url-datalist",
    values: [
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        "https://api.deepseek.com/v1",
    ],
};

LLMCodeGeneratorNamespace.modulesDatalistInfo = {
    id: "llm-code-generator-module-datalist",
    values: [
        "qwen-max",
        "qwq-plus",
        "deepseek-r1",
        "deepseek-chat",
        "deepseek-reasoner",
    ],
};

LLMCodeGeneratorNamespace.nodeInformation = MEMORY_GET("node-information"); // readonly

LLMCodeGeneratorNamespace.promptConfig = {
    operators: LLMCodeGeneratorNamespace.nodeInformation?.operators?.map(
        (op) => {
            return {
                apiName: op.apiName,
                args: op.args.map((arg) => {
                    return {
                        key: arg.name,
                        validPatterns: arg?.type?.reg
                            ? arg?.type?.reg?.toString()
                            : arg?.type?.values,
                        defaultValue: arg.default,
                    };
                }),
                framework: op.framework,
                link: op.link,
            };
        }
    ),
    connectRules:
        LLMCodeGeneratorNamespace.nodeInformation?.connectionRule?.map(
            (rule) => {
                return {
                    name: rule.name,
                    tip: rule.tip,
                };
            }
        ),
};

LLMCodeGeneratorNamespace.prompt = `Role: You are a professional PMoS code generation expert
Core Function: Generate PMoS-compliant code based on neural network flowchart descriptions
IO: Accept natural language/existing code, output strictly schema-compliant JSON

PMoS's JSON Schema:
{
  "nodes": [
    {
      "apiName": "officially_supported_operator",
      "content": {
        "param1": "value1 (config-compliant)",
        "param2": "value2 (config-compliant)"
      }
    }
  ],
  "connections": [
    {
      "srcNodeIdx": "source_index (0-based)",
      "srcEndpointIdx": "output_endpoint (0-based)",
      "tarNodeIdx": "target_index (0-based)",
      "tarEndpointIdx": "input_endpoint (0-based)" 
    }
  ]
}

Processing Workflow:
1. Operator Analysis
    - Strictly match official operator list from config
    - For unrecognized operators:
        - Prioritize finding interface-compatible substitutes
        - Clearly state unsupported reasons if no substitution
2. Connection Mapping
    - Document input/output endpoint counts per operator
    - Establish endpoint-level precision mapping (critical for multi-endpoint cases)
    - Validate connection validity (prevent cycles/invalid links)
3. Parameter Handling
    - Strictly adhere to config specifications:
        - All parameters must be filled, even it equals to default value.
        - Value types strictly enforced (as config)
4. Code Generation
    - Perform self-check after generation:
        - Validate all node indices
        - Verify endpoint numbers within valid range
        - Confirm parameter completeness/compliance

Critical Notes:
1. Node indices must be 0-based
2. Remember the endpoints of a node are recorded in config, and distinguish between inputs and outputs carefully
3. Please output the complete, unobserved, conforming JSON code. Always prioritize generating directly executable code for PMoS parser
4. Ensure your answer has one and only one markdown format JSON block, and you can output some explanation without breaking the JSON format
5. The format of the operator params needs to match the regular expression in the config.
6. All parameters mentioned in config must be filled in nodes[].content, even if they are consistent with the default values.
7. Carefully read and analyze config before analyzing user requirements

Config:
${JSON.stringify(LLMCodeGeneratorNamespace.promptConfig, null, 2)}`;
