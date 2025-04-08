/**
 * object:{
 *      nodes:[{apiName:...,content:{...}},...],
 *      connections:[{srcNodeIdx:...,srcEndpointIdx:...,tarNodeIdx:...,tarEndpointIdx:...},...]
 * }
 *
 * MESSAGE_TYPE.ImportGraph
 *      [<event.detail.default string>]
 *      [<event.detail.withoutConfirm bool>]
 *      [<event.detail.callback>]
 *
 * MESSAGE_TYPE.ExportGraph
 *      return the first time calculate result.
 *      [<event.detail.nodes Set<Node>|Array<Node>>]
 *      [<event.detail.containCoordinate bool>]
 *      [<event.detail.quiet bool>]
 *
 * MESSAGE_TYPE.CheckImportGraph
 *      <event.detail.data:object> => return null when ok, return "error_reason" when error
 */

const IMPORT_ICON = ICONS.import;
const EXPORT_ICON = ICONS.export;

(function () {
    window.addPortHelper = () => {
        MESSAGE_HANDLER(MESSAGE_TYPE.ImportGraph, (event) => {
            const jsonTextEle = document.createElement("textarea");
            jsonTextEle.className = "port-textarea";
            jsonTextEle.placeholder =
                "Enter graph code here, and cover previous graph.";
            if (event.detail?.default) {
                jsonTextEle.value = event.detail.default;
            }

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
                    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                        config: PROMPT_CONFIG.ERROR,
                        iconSvg: IMPORT_ICON,
                        content: "Json parse failed, check your code!",
                        timeout: 5000,
                    });
                    return;
                }

                const containCoordinate =
                    importObject.containCoordinate === true;

                // step1: clear
                MESSAGE_CALL(MESSAGE_TYPE.ClearNodes);

                // step2.1: create
                const result = MESSAGE_CALL(MESSAGE_TYPE.CreateNodes, {
                    nodesInfo: importObject.nodes,
                    connectionsInfo: importObject.connections,
                    viewportCoordinate: true,
                });

                // step2.2: if create not success
                if (result.includes(false)) {
                    // error
                    console.error(
                        `[ImportGraph] graph create failed!`,
                        importObject
                    );
                    MESSAGE_CALL(MESSAGE_TYPE.ClearNodes);
                    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                        config: PROMPT_CONFIG.ERROR,
                        iconSvg: IMPORT_ICON,
                        content: "Graph create failed, check your code!",
                        timeout: 5000,
                    });
                    return;
                }

                // step3: clean
                setTimeout(() => {
                    // step3.1 tidy
                    if (!containCoordinate) {
                        MESSAGE_CALL(MESSAGE_TYPE.TidyNodes, {
                            notNeedCovering: true,
                        });
                    } else {
                        MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
                    }

                    if (event.detail?.callback) {
                        event.detail.callback();
                    }

                    // step3.2 prompt
                    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                        config: PROMPT_CONFIG.INFO,
                        iconSvg: IMPORT_ICON,
                        content: `Imported ${importObject.nodes.length} node(s), ${importObject.connections.length} edge(s).`,
                        timeout: 1000,
                    });
                }, 0);
            };

            const importCheckButton = document.createElement("button");
            importCheckButton.className = "port-button";

            jsonTextEle.onchange = () => {
                let checkResult;
                try {
                    checkResult = MESSAGE_CALL(MESSAGE_TYPE.CheckImportGraph, {
                        data: jsonTextEle.value,
                    });
                    if (checkResult.length === 0) {
                        throw "Not check result";
                    }
                } catch (err) {
                    console.error(`[ImportGraph] import check failed!`, {
                        err: err,
                        value: jsonTextEle.value,
                    });
                    checkResult = ["Unexpected error, please contact us!"];
                }

                checkResult = checkResult[0];
                if (checkResult !== null) {
                    importCheckButton.classList.add("port-button-disable");
                    importCheckButton.textContent = checkResult;
                } else {
                    importCheckButton.classList.remove("port-button-disable");
                    importCheckButton.textContent = "Import to Graph";
                }
            };
            jsonTextEle.onchange();

            const importNodes = () => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                    title: "Importing Nodes...",
                    afterInit: () => {
                        importNodesFromJsonTextEle();
                        MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                    },
                });
            };

            importCheckButton.onclick = () => {
                if (importCheckButton.classList.contains("port-button-disable"))
                    return;

                MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose, {
                    afterClose: importNodes,
                });
            };

            if (event.detail?.withoutConfirm) {
                importNodes();
                return;
            }
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                title: "Import Graph",
                elements: [jsonTextEle, importCheckButton],
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
                init: () => jsonTextEle.focus(),
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ExportGraph, (event) => {
            // base on node.inputEndpointPrev
            const allNodes = [];
            if (
                event.detail?.nodes === undefined ||
                event.detail.nodes[Symbol.iterator] === undefined
            ) {
                const canvasEle = document.getElementById("canvas");
                for (const element of canvasEle.children) {
                    const elementClassName = String(element?.className);
                    if (!elementClassName.includes("node")) continue;
                    allNodes.push(element.origin);
                }
            } else {
                for (const node of event.detail.nodes) {
                    allNodes.push(node);
                }
            }

            const exportProperty = {
                containCoordinate: event.detail?.containCoordinate === true,
                jsonStr: "",
            };

            // elements
            const exportCoordinateCombo = document.createElement("div");
            exportCoordinateCombo.className = "port-setting-combo";
            const exportCoordinateInputEle = document.createElement("select");
            exportCoordinateInputEle.className = "port-setting-input";
            for (const value of [false, true]) {
                const optionEle = document.createElement("option");
                optionEle.value = value;
                optionEle.textContent =
                    value.toString().charAt(0).toUpperCase() +
                    value.toString().slice(1);
                exportCoordinateInputEle.appendChild(optionEle);
            }
            exportCoordinateInputEle.value = exportProperty.containCoordinate;
            const exportCoordinateTitleEle = document.createElement("label");
            exportCoordinateTitleEle.textContent = "Export with coordinates";
            exportCoordinateCombo.appendChild(exportCoordinateTitleEle);
            exportCoordinateCombo.appendChild(exportCoordinateInputEle);

            const exportJsonTextEle = document.createElement("textarea");
            exportJsonTextEle.className = "port-textarea";
            exportJsonTextEle.readOnly = true;

            const exportCopyEle = document.createElement("button");
            exportCopyEle.className = "port-button";
            exportCopyEle.textContent = "Copy to Clipboard";
            exportCopyEle.onclick = () => {
                navigator.clipboard.writeText(exportProperty.jsonStr);

                exportCopyEle.textContent = "Copied!";
                if (exportCopyEle.timeoutId) {
                    clearTimeout(exportCopyEle.timeoutId);
                    exportCopyEle.timeoutId = null;
                }

                exportCopyEle.timeoutId = setTimeout(() => {
                    exportCopyEle.textContent = "Copy to Clipboard";
                }, 1000);
            };

            const updateExportData = () => {
                const nodeId2Index = new Map();

                const exportObject = {};
                if (exportProperty.containCoordinate) {
                    exportObject.containCoordinate =
                        exportProperty.containCoordinate;
                }
                exportObject.nodes = [];
                for (const [idx, node] of allNodes.entries()) {
                    const nodeObject = {};
                    nodeObject.apiName = node.config.apiName;
                    nodeObject.content = {};
                    for (const [k, v] of Object.entries(node.content)) {
                        if (k === "default") continue;
                        nodeObject.content[k] = v;
                    }
                    if (exportProperty.containCoordinate) {
                        const nodeCoordinate = node.getCoordinates();
                        nodeObject.left = nodeCoordinate.left;
                        nodeObject.top = nodeCoordinate.top;
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
                        if (sourceIdx === undefined) {
                            continue;
                        }

                        exportObject.connections.push({
                            srcNodeIdx: sourceIdx,
                            srcEndpointIdx: sourceEndpointIdx,
                            tarNodeIdx: targetIdx,
                            tarEndpointIdx: targetEndpointIdx,
                        });
                    }
                }
                exportProperty.jsonStr = JSON.stringify(exportObject);

                exportJsonTextEle.value = exportProperty.jsonStr;
            };
            updateExportData();

            exportCoordinateInputEle.onchange = () => {
                const value =
                    exportCoordinateInputEle.value.toLowerCase() === "true";
                if (exportProperty.containCoordinate !== value) {
                    exportProperty.containCoordinate = value;
                    updateExportData();
                }
            };

            if (!event.detail?.quiet) {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                    title: "Export Graph",
                    elements: [
                        exportCoordinateCombo,
                        exportJsonTextEle,
                        exportCopyEle,
                    ],
                    buttonMode: COVERING_BUTTON_MODE.CloseButton,
                    init: () => exportJsonTextEle.focus(),
                });
            }

            return exportProperty.jsonStr;
        });

        const nodeInformation = MEMORY_GET(MEMORY_KEYS.NodeInformation); // readonly
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
