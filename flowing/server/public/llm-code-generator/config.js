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
    values: ["qwen-max", "deepseek-r1", "deepseek-chat", "deepseek-reasoner"],
};
LLMCodeGeneratorNamespace.nodeInformation = JSON.stringify(
    MEMORY_GET("node-information")
); // readonly
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
3. **Please output the complete, unobserved, conforming JSON code. Always prioritize generating directly executable code for PMoS parser**
4. **Ensure your answer contains and only one markdown format JSON block**
5. **The format of the operator params needs to match the regular expression in the config**
6. Carefully read and analyze config before analyzing user requirements

Config:
${LLMCodeGeneratorNamespace.nodeInformation}`;
