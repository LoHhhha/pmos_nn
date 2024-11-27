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
                        node.updateOutline();
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
                        node.updateOutline();
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
                        node.updateOutline();
                    }
                    usedInputName.add(node.content.name);
                    node.updateOutline();
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
                        node.updateOutline();
                    }
                    usedOutputName.add(node.content.name);
                    node.updateOutline();
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
                console.warn("[Connection]", info);
                return;
            }

            const tarEndpointIdx = targetNode.inputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === targetEndpoint.uuid;
                }
            );
            if (tarEndpointIdx === -1) {
                console.warn("[Connection]", info);
                return;
            }

            targetNode.inputEndpointPrev[tarEndpointIdx] = new Point(
                sourceNode.id,
                srcEndpointIdx
            );
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
                console.warn("[ConnectionDetach]", info);
                return;
            }

            const tarEndpointIdx = targetNode.inputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === targetEndpoint.uuid;
                }
            );
            if (tarEndpointIdx === -1) {
                console.warn("[ConnectionDetach]", info);
                return;
            }

            targetNode.inputEndpointPrev[tarEndpointIdx] = null;
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
                                `Server internal error as ${xhr.responseText}, please contact us.`
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
                        window.open(`/model/download/${info.fn}`);
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
    };
})();
