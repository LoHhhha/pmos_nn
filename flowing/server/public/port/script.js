/**
 * object:{
 *      nodes:[{apiName:...,content:{...},left,top},...],
 *      connections:[{srcNodeIdx:...,srcEndpointIdx:...,tarNodeIdx:...,tarEndpointIdx:...},...]
 * }
 *
 * MESSAGE_TYPE.ImportGraph
 *      [<event.detail.default string>]
 *      [<event.detail.withoutConfirm bool>]
 *      [<event.detail.callback>]
 *
 * MESSAGE_TYPE.ImportNodes
 *      <event.detail.data object_code>
 *      (view left/top)
 *      <event.detail.left int>
 *      <event.detail.top int>
 *
 * MESSAGE_TYPE.ExportGraph
 *      return the first time calculate result.
 *      [<event.detail.nodes Set<Node>|Array<Node>>]
 *      [<event.detail.containCoordinate bool>]
 *      [<event.detail.quiet bool>]
 *
 * MESSAGE_TYPE.CheckImportGraph
 *      <event.detail.data: object_code> => return null when ok, return "error_reason" when error
 */

const IMPORT_ICON = ICONS.import;
const EXPORT_ICON = ICONS.export;

(function () {
    window.addPortHelper = () => {
        const objectParse = (code, prompt = true) => {
            let object = null;
            try {
                object = JSON.parse(code);
            } catch (err) {
                console.error(
                    `[objectParse] json '${code}' parse failed!`,
                    err
                );
                if (prompt) {
                    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                        config: PROMPT_CONFIG.ERROR,
                        iconSvg: IMPORT_ICON,
                        content: I18N_STRINGS.code_json_parse_error,
                        timeout: 5000,
                    });
                }
            }
            return object;
        };

        const objectCheck = (data) => {
            let checkResult;
            try {
                checkResult = MESSAGE_CALL(MESSAGE_TYPE.CheckImportGraph, {
                    data,
                }).at(0);
            } catch (err) {
                console.error(`[objectCheck] check failed!`, {
                    err,
                    data,
                });
                checkResult = I18N_STRINGS.unexpected_error_format?.format(err);
            }
            return checkResult;
        };

        MESSAGE_HANDLER(MESSAGE_TYPE.ImportGraph, (event) => {
            const jsonTextEle = document.createElement("textarea");
            jsonTextEle.className = "port-textarea";
            jsonTextEle.placeholder = I18N_STRINGS.import_placeholder;
            if (event.detail?.default) {
                jsonTextEle.value = event.detail.default;
            }

            const importNodesFromJsonTextEle = () => {
                const jsonText = jsonTextEle.value;

                let importObject = objectParse(jsonText);
                if (importObject === null) {
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
                        content: I18N_STRINGS.code_graph_create_error,
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
                        content:
                            I18N_STRINGS.change_nodes_and_connections_format?.format(
                                I18N_STRINGS.import,
                                importObject.nodes.length,
                                importObject.connections.length
                            ),
                        timeout: 1000,
                    });
                }, 0);
            };

            const importCheckButton = document.createElement("button");
            importCheckButton.className = "port-button";

            jsonTextEle.onchange = () => {
                const checkResult = objectCheck(jsonTextEle.value);
                if (checkResult !== null) {
                    importCheckButton.classList.add("port-button-disable");
                    importCheckButton.textContent = checkResult;
                } else {
                    importCheckButton.classList.remove("port-button-disable");
                    importCheckButton.textContent = I18N_STRINGS.import;
                }
            };
            jsonTextEle.onchange();

            const importNodes = () => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                    title: I18N_STRINGS.importing_graph,
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
                title: I18N_STRINGS.import_graph,
                elements: [jsonTextEle, importCheckButton],
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
                init: () => jsonTextEle.focus(),
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ImportNodes, (event) => {
            if (
                event.detail?.data === undefined ||
                event.detail?.left === undefined ||
                event.detail?.top === undefined
            ) {
                console.error("[ImportNodes] unexpected params", event);
                return;
            }

            // step1: check
            const checkResult = objectCheck(event.detail.data);
            if (checkResult !== null) {
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.ERROR,
                    iconSvg: IMPORT_ICON,
                    content: checkResult,
                    timeout: 5000,
                });
                return;
            }

            // step2: change coordinate
            let object = objectParse(event.detail.data);
            if (object === null) {
                return;
            }

            const containCoordinate = object.containCoordinate === true;
            if (containCoordinate) {
                let midLeft = 0,
                    midTop = 0;
                for (const { left, top } of object.nodes) {
                    midLeft += left;
                    midTop += top;
                }
                midLeft /= object.nodes.length;
                midTop /= object.nodes.length;

                for (const node of object.nodes) {
                    node.left = node.left - midLeft + event.detail.left;
                    node.top = node.top - midTop + event.detail.top;
                }
            } else {
                const height = rootStyle
                    .var("--node-height")
                    .match(/\d+/g)
                    .map(parseInt)[0];

                let prevTop = event.detail.top;
                for (const node of object.nodes) {
                    node.left = event.detail.left;
                    node.top = prevTop;
                    prevTop += height;
                }
            }

            // step3: create
            const result = MESSAGE_CALL(MESSAGE_TYPE.CreateNodes, {
                nodesInfo: object.nodes,
                connectionsInfo: object.connections,
                viewportCoordinate: true,
            });
            if (result.includes(false)) {
                // error
                console.error(`[ImportNodes] nodes create failed!`, object);
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.ERROR,
                    iconSvg: IMPORT_ICON,
                    content: I18N_STRINGS.code_graph_create_error,
                    timeout: 5000,
                });
                return;
            }

            // step4: prompt
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: IMPORT_ICON,
                content:
                    I18N_STRINGS.change_nodes_and_connections_format?.format(
                        I18N_STRINGS.import,
                        object.nodes.length,
                        object.connections.length
                    ),
                timeout: 1000,
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
            exportCoordinateTitleEle.textContent =
                I18N_STRINGS.coordinates_export;
            exportCoordinateCombo.appendChild(exportCoordinateTitleEle);
            exportCoordinateCombo.appendChild(exportCoordinateInputEle);

            const exportJsonTextEle = document.createElement("textarea");
            exportJsonTextEle.className = "port-textarea";
            exportJsonTextEle.readOnly = true;

            const exportCopyEle = document.createElement("button");
            exportCopyEle.className = "port-button";
            exportCopyEle.textContent = I18N_STRINGS.copy_to_clipboard;
            exportCopyEle.onclick = () => {
                navigator.clipboard.writeText(exportProperty.jsonStr);

                exportCopyEle.textContent = I18N_STRINGS.copied;
                if (exportCopyEle.timeoutId) {
                    clearTimeout(exportCopyEle.timeoutId);
                    exportCopyEle.timeoutId = null;
                }

                exportCopyEle.timeoutId = setTimeout(() => {
                    exportCopyEle.textContent = I18N_STRINGS.copy_to_clipboard;
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
                    title: I18N_STRINGS.export_graph,
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
                return I18N_STRINGS.json_grammar_check_fail;
            }

            // scheme check
            if (
                !(object.nodes instanceof Array) ||
                !(object.connections instanceof Array)
            ) {
                console.error("[CheckImportGraph] json scheme check failed!", {
                    data,
                });
                return I18N_STRINGS.json_scheme_check_fail;
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
                    return I18N_STRINGS.node_param_not_found_format?.format(
                        idx,
                        "apiName"
                    );
                }

                if (content == undefined) {
                    console.error(
                        `[CheckImportGraph] node${idx} content not found!`,
                        { data }
                    );
                    return I18N_STRINGS.node_param_not_found_format?.format(
                        idx,
                        "content"
                    );
                }

                const nodeConfig = apiName2operators.get(apiName);
                if (nodeConfig === undefined) {
                    console.error(
                        `[CheckImportGraph] node${idx} ${apiName} not supported!`,
                        { data }
                    );
                    return I18N_STRINGS.node_unsupported_format?.format(
                        idx,
                        apiName
                    );
                }

                for (const arg of nodeConfig.args) {
                    if (!content.hasOwnProperty(arg.name)) {
                        console.error(
                            `[CheckImportGraph] node${idx} param-${arg.name} not found!`,
                            { data }
                        );
                        return I18N_STRINGS.node_param_not_found_format?.format(
                            idx,
                            `content.${arg.name}`
                        );
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
                        return I18N_STRINGS.node_param_invalid_format?.format(
                            idx,
                            `content.${arg.name}`
                        );
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
                    return I18N_STRINGS.connection_indexes_not_found_format?.format(
                        idx
                    );
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
                    return I18N_STRINGS.connection_node_indexes_invalid_format?.format(
                        idx
                    );
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
                    return I18N_STRINGS.connection_endpoint_indexes_invalid_format?.format(
                        idx
                    );
                }
            }

            // check coordinate
            const containCoordinate = object.containCoordinate === true;
            if (containCoordinate) {
                for (const [idx, node] of object.nodes.entries()) {
                    if (node.left === undefined || node.top === undefined) {
                        console.error(
                            `[CheckImportGraph] coordinates lost in node${idx}!`,
                            { data }
                        );
                        return I18N_STRINGS.node_coordinates_lost_format?.format(
                            idx
                        );
                    }
                }
            }

            return null;
        });
    };
})();
