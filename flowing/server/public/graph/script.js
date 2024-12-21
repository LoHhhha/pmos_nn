/**
 * MESSAGE_TYPE.CalculateGraph
 *
 * MESSAGE_TYPE.UpdateShape
 *      <event.detail.node: Node>
 *
 */

const SHAPE_CONNECTION_OVERLAY_ID = "shape-overlay";
const ERROR_RESULT_SHAPE = undefined;
const NOT_SHAPE = null;

(function () {
    function calculate(canvas) {
        const nodeId2Idx = new Map(),
            inputId2Idx = new Map(),
            outputId2Idx = new Map();

        let nodeIdx = 0,
            inputIdx = 0,
            outputIdx = 0;

        const graph = new Graph();

        const usedInputName = new Set(),
            usedOutputName = new Set();

        // build all id2idx
        for (const element of canvas.children) {
            const node = element.origin;
            const nodeClassName = String(element.className);
            if (!nodeClassName.includes("node")) continue;

            if (node.inputEndpointPrev.includes(null)) {
                console.error(
                    "[calculate] find a node that input was empty which is ",
                    node
                );
                return null;
            }

            const nodeId = node.id;
            if (node.config.apiName === "Input") {
                if (node.content.name !== "None") {
                    if (usedInputName.has(node.content.name)) {
                        let addHash = 0;
                        while (
                            usedInputName.has(`${node.content.name}_${addHash}`)
                        ) {
                            addHash++;
                        }

                        node.content.name = `${node.content.name}_${addHash}`;
                        node.update();
                    }
                    usedInputName.add(node.content.name);
                }
                let shape = null;
                for (const arg of node.config.args) {
                    if (arg.name === "shape") {
                        shape = arg.type.getValue(node.content.shape);
                        break;
                    }
                }
                if (shape === null) {
                    console.error(
                        "[calculate] find a input node that have not 'shape', as ",
                        node
                    );
                    return null;
                }
                graph.input_nodes.push(new InputNode(shape));

                inputId2Idx.set(nodeId, inputIdx++);
            } else if (node.config.apiName === "Output") {
                if (node.content.name !== "None") {
                    if (usedOutputName.has(node.content.name)) {
                        let addHash = 0;
                        while (
                            usedOutputName.has(
                                `${node.content.name}_${addHash}`
                            )
                        ) {
                            addHash++;
                        }
                        node.content.name = `${node.content.name}_${addHash}`;
                        node.update();
                    }
                    usedOutputName.add(node.content.name);
                }
                graph.output_nodes.push(new OutputNode());

                outputId2Idx.set(nodeId, outputIdx++);
            } else {
                const layerNode = new LayerNode(node.config.apiName);
                for (const arg of node.config.args) {
                    layerNode.args.push({
                        key: arg.name,
                        value: arg.type.getValue(node.content[arg.name]),
                    });
                }
                graph.net_nodes.push(layerNode);

                nodeId2Idx.set(nodeId, nodeIdx++);
            }
        }

        // build graph
        for (const element of canvas.children) {
            const node = element.origin;
            const nodeClassName = String(element.className);
            if (!nodeClassName.includes("node")) continue;

            let idx = -1;
            const nodeId = node.id;
            if (node.config.apiName === "Input") {
                if (!inputId2Idx.has(nodeId)) {
                    console.warn(
                        "[calculate] find a unexpected node as ",
                        node
                    );
                    continue;
                }
                idx = inputId2Idx.get(nodeId);

                if (node.content.name === "None") {
                    node.content.name = `input_${idx}`;
                    if (usedInputName.has(node.content.name)) {
                        let addHash = 0;
                        while (
                            usedInputName.has(`${node.content.name}_${addHash}`)
                        ) {
                            addHash++;
                        }
                        node.content.name = `${node.content.name}_${addHash}`;
                        node.update();
                    }
                    usedInputName.add(node.content.name);
                    node.update();
                }
                graph.input_nodes[idx].name = node.content.name;
            } else if (node.config.apiName === "Output") {
                if (!outputId2Idx.has(nodeId)) {
                    console.warn(
                        "[calculate] find a unexpected node as ",
                        node
                    );
                    continue;
                }
                idx = outputId2Idx.get(nodeId);

                if (node.content.name === "None") {
                    node.content.name = `output_${idx}`;
                    if (usedOutputName.has(node.content.name)) {
                        let addHash = 0;
                        while (
                            usedOutputName.has(
                                `${node.content.name}_${addHash}`
                            )
                        ) {
                            addHash++;
                        }
                        node.content.name = `${node.content.name}_${addHash}`;
                        node.update();
                    }
                    usedOutputName.add(node.content.name);
                    node.update();
                }
                graph.output_nodes[idx].name = node.content.name;

                // only one
                for (const point of node.inputEndpointPrev) {
                    if (!nodeId2Idx.has(point.nodeId)) {
                        console.error(
                            "[calculate] find a node that prev node isn't a 'node' which is ",
                            node
                        );
                        return null;
                    }
                    graph.output_nodes[idx].from_data = new NodeDataPair(
                        nodeId2Idx.get(point.nodeId),
                        point.endpointIdx
                    );
                }
            } else {
                if (!nodeId2Idx.has(nodeId)) {
                    console.warn("calculate: find a unexpected node as ", node);
                    continue;
                }
                idx = nodeId2Idx.get(nodeId);

                for (
                    var inputEndpointIdx = 0;
                    inputEndpointIdx < node.inputEndpointPrev.length;
                    inputEndpointIdx++
                ) {
                    const point = node.inputEndpointPrev[inputEndpointIdx];
                    if (inputId2Idx.has(point.nodeId)) {
                        // prev is input
                        graph.input_nodes[
                            inputId2Idx.get(point.nodeId)
                        ].to_data.push(new NodeDataPair(idx, inputEndpointIdx));
                        graph.net_nodes[idx].from_data.push(null);
                    } else if (nodeId2Idx.has(point.nodeId)) {
                        graph.net_nodes[idx].from_data.push(
                            new NodeDataPair(
                                nodeId2Idx.get(point.nodeId),
                                point.endpointIdx
                            )
                        );
                    } else {
                        console.error(
                            "[calculate] find a node that prev node is unexpected which is ",
                            node
                        );
                        return null;
                    }
                }
            }
        }

        return graph;
    }

    function shapeEqual(s1, s2) {
        if (s1 && s2) {
            return s1.toString() === s2.toString();
        }
        return s1 == s2;
    }

    function addShapeToConnection(connection, shape) {
        if (shape === NOT_SHAPE) {
            console.error(
                "[AddShapeToConnection] detect a NOT_SHAPE",
                connection
            );
            removeShapeFromConnection(connection);
            return;
        }

        // shape === ERROR_RESULT_SHAPE mean error shape
        let shapeShow =
            shape === ERROR_RESULT_SHAPE ? "Error" : shape.join("*");

        const overlay = connection.getOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        if (overlay) {
            overlay.setLabel(shapeShow);
            connection.showOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        } else {
            connection.addOverlay({
                type: "Label",
                options: {
                    location: 0.5,
                    label:shapeShow,
                    cssClass: "connection-overlay",
                    id: SHAPE_CONNECTION_OVERLAY_ID,
                },
            });
        }
        connection.instance.repaint(connection.source);
    }

    function removeShapeFromConnection(connection) {
        const overlay = connection.getOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        if (overlay) {
            connection.hideOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        } else {
            console.warn(
                "[AddShapeToConnection] detect a connection not have shape overlay",
                connection
            );
            return;
        }
    }

    function pushShape(node) {
        if (
            node.inputEndpointShape.includes(NOT_SHAPE) ||
            node.inputEndpointShape.includes(ERROR_RESULT_SHAPE)
        ) {
            console.debug("[PushShape] clear", node);
            // need to clear

            for (let idx = 0; idx < node.outputEndpoint.length; idx++) {
                // clear shape
                // if NOT_SHAPE mean that not need to clear
                if (node.outputEndpointShape[idx] === NOT_SHAPE) continue;
                node.outputEndpointShape[idx] = NOT_SHAPE;

                // clear connection's overlays
                for (const connection of node.outputEndpointConnection[idx]) {
                    // clear connection overlay
                    removeShapeFromConnection(connection);

                    // clear next node inputEndpointShape
                    const nextNode = connection.target.origin;
                    let targetEndpointIdx = -1;
                    for (
                        let eIdx = 0;
                        eIdx < nextNode.inputEndpointPrev.length;
                        eIdx++
                    ) {
                        if (
                            nextNode.inputEndpointPrev[eIdx].nodeId === node.id
                        ) {
                            targetEndpointIdx = eIdx;
                        }
                    }
                    if (targetEndpointIdx === -1) {
                        console.error(
                            "[PushShape] found a unexpect target endpoint",
                            node
                        );
                        return;
                    }
                    nextNode.inputEndpointShape[targetEndpointIdx] = NOT_SHAPE;
                    pushShape(nextNode);
                }
            }
        } else {
            console.debug("[PushShape] calculate", node);
            // need to update

            // Output not need to update
            if (node.outputEndpoint.length === 0) {
                return;
            }

            const push = () => {
                // update next node
                for (let idx = 0; idx < node.outputEndpoint.length; idx++) {
                    for (const connection of node.outputEndpointConnection[
                        idx
                    ]) {
                        // clear connection overlay
                        removeShapeFromConnection(connection);

                        // add connection shape overlay
                        addShapeToConnection(
                            connection,
                            node.outputEndpointShape[idx]
                        );

                        // update next node inputEndpointShape
                        const nextNode = connection.target.origin;
                        // get target endpoint
                        const nextEndpoint = connection.endpoints[1];
                        const targetEndpointIdx =
                            nextNode.inputEndpoint.findIndex((endpoint) => {
                                return endpoint.uuid === nextEndpoint.uuid;
                            });
                        if (targetEndpointIdx === -1) {
                            console.error(
                                "[PushShape] found a unexpect target endpoint",
                                node
                            );
                            return;
                        }
                        // check if not need to push
                        if (
                            shapeEqual(
                                nextNode.inputEndpointShape[targetEndpointIdx],
                                node.outputEndpointShape[idx]
                            )
                        ) {
                            // not need to push
                            continue;
                        }
                        // update inputEndpointShape
                        // maybe ERROR_RESULT_SHAPE
                        if (
                            node.outputEndpointShape[idx] ===
                                ERROR_RESULT_SHAPE ||
                            node.outputEndpointShape[idx] === NOT_SHAPE
                        ) {
                            nextNode.inputEndpointShape[targetEndpointIdx] =
                                NOT_SHAPE;
                        } else {
                            nextNode.inputEndpointShape[targetEndpointIdx] =
                                node.outputEndpointShape[idx].concat();
                        }
                        pushShape(nextNode);
                    }
                }
            };

            // Input node just need to push and not need to update
            if (node.inputEndpoint.length === 0) {
                // if have shape, using to outputEndpointShape
                const shape = node.content.shape
                    .match(/[-+]?\d+/g)
                    .map((item) => {
                        return parseInt(item, 10);
                    });
                node.outputEndpointShape[0] = shape;
                push();
                return;
            }

            // update shape
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/shape/calculate/pytorch", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }

                if (xhr.status !== 200) {
                    switch (xhr.status) {
                        case 0:
                            MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                                config: PROMPT_CONFIG.ERROR,
                                content:
                                    "[ShapeCalculate] Disconnect from server, please contact us!",
                                timeout: 5000,
                            });
                            break;
                        default:
                            MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                                config: PROMPT_CONFIG.ERROR,
                                content: `[ShapeCalculate] Server internal error as ${
                                    JSON.parse(xhr.responseText).msg
                                }, please contact us.`,
                                timeout: 5000,
                            });
                    }
                    return;
                }

                const info = JSON.parse(xhr.responseText);
                if (info.net_nodes_shape === undefined) {
                    MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                        config: PROMPT_CONFIG.ERROR,
                        content: `[ShapeCalculate] Found error result from sever.`,
                        timeout: 5000,
                    });
                    return;
                }

                // only one node
                if (info.net_nodes_shape.length != 1) {
                    console.error(
                        "[ShapeCalculate] get a unexpected net_nodes_shape",
                        info.net_nodes_shape
                    );
                    return;
                }

                let newShape = info.net_nodes_shape[0];
                // if return None means fail to calculate.
                if (newShape === null) {
                    console.debug(
                        "[ShapeCalculate] fail due to args and input_shape not match",
                        node
                    );
                    newShape = new Array(node.outputEndpointShape.length);
                    for (let idx = 0; idx < newShape.length; idx++) {
                        newShape[idx] = ERROR_RESULT_SHAPE;
                    }
                }

                if (newShape.length !== node.outputEndpointShape.length) {
                    console.warn(
                        "[ShapeCalculate] get a unexpected shape from result",
                        node,
                        newShape
                    );
                    while (newShape.length < node.outputEndpointShape.length) {
                        newShape.push(NOT_SHAPE);
                    }
                }

                // update shape
                console.debug("[ShapeCalculate] get", newShape);
                for (let idx = 0; idx < newShape.length; idx++) {
                    node.outputEndpointShape[idx] = newShape[idx];
                }

                push();
            };

            const layerNode = new LayerNode(node.config.apiName);
            // let from_data as null
            layerNode.from_data = new Array(node.inputEndpoint.length).fill(
                null
            );
            for (const arg of node.config.args) {
                layerNode.args.push({
                    key: arg.name,
                    value: arg.type.getValue(node.content[arg.name]),
                });
            }
            xhr.send(
                JSON.stringify({
                    timestamp: new Date().getDate(),
                    data: JSON.stringify({
                        net_node_infos: [
                            { node: layerNode, shape: node.inputEndpointShape },
                        ],
                    }),
                    name: null,
                })
            );
        }
    }

    window.createJsPlumbConnectionListener = (jsPlumbInstance) => {
        jsPlumbInstance.bind("connection", (info) => {
            const sourceNode = info.source.origin;
            const targetNode = info.target.origin;
            const sourceEndpoint = info.sourceEndpoint;
            const targetEndpoint = info.targetEndpoint;

            const srcEndpointIdx = sourceNode.outputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === sourceEndpoint.uuid;
                }
            );
            if (srcEndpointIdx === -1) {
                console.warn(
                    "[Connection] not found sourceNode-outputEndpoint",
                    info
                );
                return;
            }

            const tarEndpointIdx = targetNode.inputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === targetEndpoint.uuid;
                }
            );
            if (tarEndpointIdx === -1) {
                console.warn(
                    "[Connection] not found targetNode-inputEndpoint",
                    info
                );
                return;
            }

            const connection = info.connection;

            // update info
            targetNode.inputEndpointPrev[tarEndpointIdx] = new Point(
                sourceNode.id,
                srcEndpointIdx
            );
            sourceNode.outputEndpointConnection[srcEndpointIdx].add(connection);

            // push shape if current node is ready or error
            if (sourceNode.outputEndpointShape[srcEndpointIdx] !== NOT_SHAPE) {
                // get shape
                let shape = sourceNode.outputEndpointShape[srcEndpointIdx];

                // push to connection
                addShapeToConnection(connection, shape);

                // shape.length === 0 mean this node get a error shape,
                targetNode.inputEndpointShape[tarEndpointIdx] =
                    shape === ERROR_RESULT_SHAPE ? NOT_SHAPE : shape.concat();
            }
            pushShape(targetNode);

            console.info(
                `[Connection] node${sourceNode.id}@out${srcEndpointIdx} -> node${targetNode.id}@in${tarEndpointIdx}`
            );
        });

        jsPlumbInstance.bind("connection:detach", (info) => {
            const sourceNode = info.source.origin;
            const targetNode = info.target.origin;
            const sourceEndpoint = info.sourceEndpoint;
            const targetEndpoint = info.targetEndpoint;

            const srcEndpointIdx = sourceNode.outputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === sourceEndpoint.uuid;
                }
            );
            if (srcEndpointIdx === -1) {
                console.warn(
                    "[ConnectionDetach] not found sourceNode-outputEndpoint",
                    info
                );
                return;
            }

            const tarEndpointIdx = targetNode.inputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === targetEndpoint.uuid;
                }
            );
            if (tarEndpointIdx === -1) {
                console.warn(
                    "[ConnectionDetach] not found targetNode-inputEndpoint",
                    info
                );
                return;
            }

            targetNode.inputEndpointPrev[tarEndpointIdx] = null;
            targetNode.inputEndpointShape[tarEndpointIdx] = NOT_SHAPE;
            if (
                !sourceNode.outputEndpointConnection[srcEndpointIdx].delete(
                    info.connection
                )
            ) {
                console.warn(
                    "[ConnectionDetach] delete connection error",
                    info
                );
            }
            pushShape(targetNode);
            console.info(
                `[Connection] node${sourceNode.id}@out${srcEndpointIdx} -X-> node${targetNode.id}@in${tarEndpointIdx}`
            );
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.CalculateGraph, () => {
            const canvasEle = document.getElementById("canvas");

            const loggerEle = document.createElement("div");
            loggerEle.className = "logger-div";

            const add2Logger = (msg) => {
                const logEle = document.createElement("div");
                logEle.className = "log-text";
                logEle.textContent = msg;
                loggerEle.appendChild(logEle);
            };

            add2Logger("Calculating network construction...");

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Calculate",
                elements: [loggerEle],
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
            });

            const graph = calculate(canvasEle);
            if (
                graph === null ||
                graph.input_nodes.length === 0 ||
                graph.net_nodes.length === 0 ||
                graph.output_nodes.length === 0
            ) {
                add2Logger(
                    "Found an impossible network construction, please check and try a again."
                );
                return;
            } else {
                add2Logger("Calculation finished!");
            }

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/model/calculate/pytorch", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }

                if (xhr.status !== 200) {
                    switch (xhr.status) {
                        case 0:
                            add2Logger(
                                `Server connect error, please contact us.`
                            );
                            break;
                        default:
                            add2Logger(
                                `Server internal error as ${
                                    JSON.parse(xhr.responseText).msg
                                }, please contact us.`
                            );
                    }
                    return;
                }

                const info = JSON.parse(xhr.responseText);
                add2Logger(`Analysis finished: ${info.msg}.`);

                if (info.fn) {
                    const downloadLink = document.createElement("button");
                    downloadLink.className = "download-button";
                    downloadLink.textContent = "Download Code";
                    downloadLink.onclick = () => {
                        window.open(`/model/download/${info.fn}`, "_blank");
                        return false;
                    };
                    loggerEle.appendChild(downloadLink);
                } else {
                    add2Logger(
                        "No file return from server, please contact us."
                    );
                }
            };
            add2Logger("Trying to analyze via server...");
            xhr.send(
                JSON.stringify({
                    timestamp: new Date().getDate(),
                    data: JSON.stringify(graph),
                    name: null,
                })
            );
            return;
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.UpdateShape, (event) => {
            if (event.detail?.node === undefined) {
                console.error(
                    "[UpdateShape] get an unexpected event as",
                    event
                );
                return;
            }

            pushShape(event.detail.node);
        });
    };
})();
