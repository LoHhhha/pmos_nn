/**
 * object:{
 *      nodes:[{apiName:...,content:{...}},...],
 *      connections:[{srcNodeIdx:...,srcEndpointIdx:...,tarNodeIdx:...,tarEndpointIdx:...},...]
 * }
 *
 * MESSAGE_TYPE.ImportGraph
 *
 * MESSAGE_TYPE.ExportGraph
 *
 * MESSAGE_TYPE.CheckImportGraph
 *      <event.detail.data:object> => return null when ok, return "error_reason" when error
 */

(function () {
    window.addPortHelper = () => {
        MESSAGE_HANDLER(MESSAGE_TYPE.ImportGraph, () => {
            const jsonTextEle = document.createElement("textarea");
            jsonTextEle.className = "port-textarea";
            jsonTextEle.placeholder =
                "Enter graph code here, and cover previous graph.";

            const importNodesFromJsonTextEle = () => {
                const jsonText = jsonTextEle.value;
                let importObject;
                try {
                    importObject = JSON.parse(jsonText);
                } catch (err) {
                    console.error(
                        `[ImportGraph] json '${jsonText}' parse failed!`,
                        err
                    );
                    MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                        config: PROMPT_CONFIG.ERROR,
                        content:
                            "[ImportGraph] Json parse failed, check your code!",
                        timeout: 5000,
                    });
                    return;
                }

                MESSAGE_CALL(MESSAGE_TYPE.ClearNode);
                const result = MESSAGE_CALL(MESSAGE_TYPE.CreateNodes, {
                    nodesInfo: importObject.nodes,
                    connectionsInfo: importObject.connections,
                });
                if (result.includes(false)) {
                    // error
                    console.error(
                        `[ImportGraph] graph create failed!`,
                        importObject
                    );
                    MESSAGE_CALL(MESSAGE_TYPE.ClearNode);
                    MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                        config: PROMPT_CONFIG.ERROR,
                        content:
                            "[ImportGraph] Graph create failed, check your code!",
                        timeout: 5000,
                    });
                    return;
                }
                setTimeout(() => {
                    MESSAGE_CALL(MESSAGE_TYPE.TidyNodes, {
                        notNeedCovering: true,
                    });

                    MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                        config: PROMPT_CONFIG.INFO,
                        content: `[ImportGraph] Imported ${importObject.nodes.length} node(s), ${importObject.connections.length} edge(s).`,
                        timeout: 1000,
                    });
                }, 0);
            };

            const pushGraph = () => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                    title: "Importing Nodes...",
                    afterInit: () => {
                        importNodesFromJsonTextEle();
                        MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                    },
                });
            };

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Import Graph",
                elements: [jsonTextEle],
                buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
                buttonCallback: {
                    confirm: pushGraph,
                },
                init: () => jsonTextEle.focus(),
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ExportGraph, () => {
            // base on node.inputEndpointPrev
            const allNodes = [];
            const canvasEle = document.getElementById("canvas");
            for (const element of canvasEle.children) {
                const elementClassName = String(element?.className);
                if (!elementClassName.includes("node")) continue;
                allNodes.push(element.origin);
            }

            const nodeId2Index = new Map();

            const exportObject = {};
            exportObject.nodes = [];
            for (const [idx, node] of allNodes.entries()) {
                const nodeObject = {};
                nodeObject.apiName = node.config.apiName;
                nodeObject.content = {};
                for (const [k, v] of Object.entries(node.content)) {
                    if (k === "default") continue;
                    nodeObject.content[k] = v;
                }
                exportObject.nodes.push(nodeObject);

                nodeId2Index.set(node.id, idx);
            }

            exportObject.connections = [];
            for (const [targetIdx, node] of allNodes.entries()) {
                for (const [
                    targetEndpointIdx,
                    point,
                ] of node.inputEndpointPrev.entries()) {
                    if (point == null) continue;

                    const [sourceId, sourceEndpointIdx] = [
                        point.nodeId,
                        point.endpointIdx,
                    ];
                    const sourceIdx = nodeId2Index.get(sourceId);

                    exportObject.connections.push({
                        srcNodeIdx: sourceIdx,
                        srcEndpointIdx: sourceEndpointIdx,
                        tarNodeIdx: targetIdx,
                        tarEndpointIdx: targetEndpointIdx,
                    });
                }
            }

            const exportJsonStr = JSON.stringify(exportObject);

            const exportJsonTextEle = document.createElement("textarea");
            exportJsonTextEle.className = "port-textarea";
            exportJsonTextEle.readOnly = true;
            exportJsonTextEle.value = exportJsonStr;

            const exportCopyEle = document.createElement("button");
            exportCopyEle.className = "port-copy-button";
            exportCopyEle.textContent = "Copy to Clipboard";
            exportCopyEle.onclick = () => {
                navigator.clipboard.writeText(exportJsonStr);

                exportCopyEle.textContent = "Copied!";
                if (exportCopyEle.timeoutId) {
                    clearTimeout(exportCopyEle.timeoutId);
                    exportCopyEle.timeoutId = null;
                }

                exportCopyEle.timeoutId = setTimeout(() => {
                    exportCopyEle.textContent = "Copy to Clipboard";
                }, 1000);
            };

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Export Graph",
                elements: [exportJsonTextEle, exportCopyEle],
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
                init: () => exportJsonTextEle.focus(),
            });
        });

        const nodeInformation = MEMORY_GET("node-information"); // readonly
        const apiName2operators = new Map();
        for (const operator of nodeInformation.operators) {
            apiName2operators.set(operator.apiName, operator);
        }

        MESSAGE_HANDLER(MESSAGE_TYPE.CheckImportGraph, (event) => {
            const data = event.detail?.data;
            if (data == undefined) {
                console.error("[CheckImportGraph] data not found!", event);
                return "[INTERNAL ERROR] Invalid parameters";
            }

            let object;
            try {
                object = JSON.parse(data);
            } catch (err) {
                console.error("[CheckImportGraph] json parse failed!", {
                    data,
                    err,
                });
                return "JSON grammar check failed";
            }

            // scheme check
            if (
                !(object.nodes instanceof Array) ||
                !(object.connections instanceof Array)
            ) {
                console.error("[CheckImportGraph] json scheme check failed!", {
                    data,
                });
                return "JSON scheme check failed";
            }

            const nodeConfigs = [];

            // check nodes
            for (const [idx, node] of object.nodes.entries()) {
                const apiName = node.apiName;
                const content = node.content;

                if (apiName == undefined) {
                    console.error(
                        `[CheckImportGraph] node${idx} apiName not found!`,
                        { data }
                    );
                    return `Operator${idx}'s apiName not found`;
                }

                if (content == undefined) {
                    console.error(
                        `[CheckImportGraph] node${idx} content not found!`,
                        { data }
                    );
                    return `Operator${idx}'s content not found`;
                }

                const nodeConfig = apiName2operators.get(apiName);
                if (nodeConfig === undefined) {
                    console.error(
                        `[CheckImportGraph] node${idx} ${apiName} not supported!`,
                        { data }
                    );
                    return `Operator${idx}-${apiName} unsupported!`;
                }

                for (const arg of nodeConfig.args) {
                    if (!content.hasOwnProperty(arg.name)) {
                        console.error(
                            `[CheckImportGraph] node${idx} param-${arg.name} not found!`,
                            { data }
                        );
                        return `Operator${idx}'s parameter(${arg.name}) not found`;
                    }

                    // check the value is valid
                    if (
                        !nodeInformation.argsValueCheck(
                            arg.type,
                            content[arg.name]
                        )
                    ) {
                        console.error(
                            `[CheckImportGraph] node${idx} param-${arg.name} invalid!`,
                            { data }
                        );
                        return `Operator${idx}'s parameter(${arg.name}) invalid`;
                    }
                }

                nodeConfigs.push(nodeConfig);
            }

            // check connection
            for (const [idx, connection] of object.connections.entries()) {
                const {
                    srcNodeIdx,
                    srcEndpointIdx,
                    tarNodeIdx,
                    tarEndpointIdx,
                } = connection;

                if (
                    !Number.isInteger(srcNodeIdx) ||
                    !Number.isInteger(srcEndpointIdx) ||
                    !Number.isInteger(tarNodeIdx) ||
                    !Number.isInteger(tarEndpointIdx)
                ) {
                    console.error(
                        `[CheckImportGraph] missing some indexes in connection${idx}!`,
                        { data }
                    );
                    return `Connection${idx} missing some indexes`;
                }

                if (
                    srcNodeIdx < 0 ||
                    srcNodeIdx >= nodeConfigs.length ||
                    tarNodeIdx < 0 ||
                    tarNodeIdx >= nodeConfigs.length
                ) {
                    console.error(
                        `[CheckImportGraph] invalid node index in connection${idx}!`,
                        { data }
                    );
                    return `Connection${idx} found invalid operator index`;
                }

                if (
                    srcEndpointIdx < 0 ||
                    srcEndpointIdx >=
                        nodeConfigs[srcNodeIdx].outputEnd.length ||
                    tarEndpointIdx < 0 ||
                    tarEndpointIdx >= nodeConfigs[tarNodeIdx].inputEnd.length
                ) {
                    console.error(
                        `[CheckImportGraph] invalid endpoint index in connection${idx}!`,
                        { data }
                    );
                    return `Connection${idx} found invalid endpoint index`;
                }
            }
            return null;
        });
    };
})();
