/**
 * MESSAGE_TYPE.ImportGraph
 *
 * MESSAGE_TYPE.ExportGraph
 *      exportObject:{nodes:[{apiName:...,content:{...}},...],connections:[{srcNodeIdx:...,srcEndpointIdx:...,tarNodeIdx:...,tarEndpointIdx:...},...]}
 */

(function () {
    window.addPortHelper = () => {
        MESSAGE_HANDLER(MESSAGE_TYPE.ImportGraph, () => {
            const jsonTextEle = document.createElement("textarea");
            jsonTextEle.className = "port-textarea";
            jsonTextEle.placeholder =
                "Enter graph code here, and cover previous graph.";

            const pushGraph = () => {
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
                MESSAGE_PUSH(MESSAGE_TYPE.TidyNodes);

                MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                    config: PROMPT_CONFIG.INFO,
                    content: `[ImportGraph] Imported ${importObject.nodes.length} node(s), ${importObject.connections.length} edge(s).`,
                    timeout: 1000,
                });
            };

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Import Graph",
                elements: [jsonTextEle],
                buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
                buttonCallback: {
                    confirm: pushGraph,
                },
                afterInit: () => jsonTextEle.focus(),
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
                afterInit: () => exportJsonTextEle.focus(),
            });
        });
    };
})();
