/**
 * MESSAGE_TYPE.CalculateGraph
 *
 * MESSAGE_TYPE.UpdateShape
 *      <event.detail.node: Node>
 *
 * MESSAGE_TYPE.TidyNodes
 *      [<event.detail.notNeedCovering>]
 */

const SHAPE_CONNECTION_OVERLAY_ID = "shape-overlay";
const ERROR_RESULT_SHAPE = undefined;
const NOT_SHAPE = null;
const SHAPE_ICON = ICONS.shape;

const CONNECTION_OVERLAY_CSS_CLASS = "connection-overlay";
const CONNECTION_OVERLAY_ERROR_CSS_CLASS = "connection-overlay-error";

const TIDY_NODES_NODE_WIDTH = rootStyle
    .var("--node-width")
    .match(/\d+/g)
    .map(parseInt)[0];
const TIDY_NODES_MAX_ITERATIONS = 64;
const TIDY_NODES_MAX_ENDPOINT_COUNT = 10;
const TIDY_NODES_ROOT_NODE_TOP_PLACE_INTERVAL = 270;
const TIDY_NODES_ROOT_NODE_SUB_GRAPH_INTERVAL = TIDY_NODES_NODE_WIDTH;
const TIDY_NODES_ROOT_NODE_GRAPH_INTERVAL = TIDY_NODES_NODE_WIDTH * 2;
const TIDY_NODES_ICON = ICONS.tidy;

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
            const nodeClassName = String(element?.className);
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
                layerNode.args = node.getArgs();
                graph.net_nodes.push(layerNode);

                nodeId2Idx.set(nodeId, nodeIdx++);
            }
        }

        // build graph
        for (const element of canvas.children) {
            const node = element.origin;
            const nodeClassName = String(element?.className);
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
        return s1 === s2;
    }

    function addShapeToConnection(connection, shape, shapeInfo) {
        if (shape === NOT_SHAPE) {
            console.error(
                "[AddShapeToConnection] detect a NOT_SHAPE",
                connection
            );
            removeShapeFromConnection(connection);
            return;
        }

        // shape === ERROR_RESULT_SHAPE mean error shape
        const errorMode = shape === ERROR_RESULT_SHAPE;
        const shapeShow = errorMode
            ? I18N_STRINGS.shape_error_tips
            : shape.join("*");
        const overlayCssClass = errorMode
            ? CONNECTION_OVERLAY_ERROR_CSS_CLASS
            : CONNECTION_OVERLAY_CSS_CLASS;

        const overlay = connection.getOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        // when no overlay or overlay.cssClass isn't overlayCssClass
        // remove and new, else using the prev.
        if (overlay == null || overlay.cssClass !== overlayCssClass) {
            connection.removeOverlay(overlay);
            connection.addOverlay({
                type: "Label",
                options: {
                    location: 0.5,
                    cssClass: overlayCssClass,
                    id: SHAPE_CONNECTION_OVERLAY_ID,
                },
            });
        }

        const finalOverlay = connection.getOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        finalOverlay.setLabel(shapeShow);
        connection.showOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        // add shapeInfo if need
        if (shapeInfo) {
            finalOverlay.showingInfo = false;
            finalOverlay.bind("click", () => {
                if (finalOverlay.showingInfo) {
                    finalOverlay.setLabel(shapeShow);
                    finalOverlay.showingInfo = false;
                } else {
                    finalOverlay.setLabel(shapeInfo);
                    finalOverlay.showingInfo = true;
                }
            });
        }

        connection.instance.repaint(connection.source);
    }

    function removeShapeFromConnection(connection) {
        const overlay = connection.getOverlay(SHAPE_CONNECTION_OVERLAY_ID);
        if (overlay == null) {
            console.warn(
                "[RemoveShapeFromConnection] detect a connection not have shape overlay",
                connection
            );
            return;
        }
        // clear prev shapeInfo/func
        overlay.unbind("click");
        connection.hideOverlay(SHAPE_CONNECTION_OVERLAY_ID);
    }

    function pushShape(node) {
        if (
            node.inputEndpointShape.includes(NOT_SHAPE) ||
            node.inputEndpointShape.includes(ERROR_RESULT_SHAPE)
        ) {
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
            // need to update

            // Output doesn't need to update
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
                            node.outputEndpointShape[idx],
                            node.outputEndpointShapeInfo
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

            // Input/Data node just need to push and not need to update
            if (node.inputEndpoint.length === 0) {
                // this node must have outputShapeComeFromArg
                if (node.config.outputShapeComeFromArg == null) {
                    console.error(
                        "[PushShape] found a unexpect input/data node which not have outputShapeComeFromArg",
                        node
                    );
                    return;
                }
                // using [outputShapeComeFromArg] to outputEndpointShape
                node.outputEndpointShape[0] = node.content[
                    node.config.outputShapeComeFromArg
                ]
                    .match(/[-+]?\d+/g)
                    .map((item) => {
                        return parseInt(item, 10);
                    });
                push();
                return;
            }

            // update shape
            const xhr = new XMLHttpRequest();
            const url = `/shape/calculate/${MEMORY_GET(
                MEMORY_KEYS.CurrentFramework,
                FRAMEWORK.pytorch
            ).toLowerCase()}`;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }

                if (xhr.status !== 200) {
                    switch (xhr.status) {
                        case 0:
                            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                                config: PROMPT_CONFIG.ERROR,
                                iconSvg: SHAPE_ICON,
                                content: I18N_STRINGS.server_disconnect,
                                timeout: 5000,
                            });
                            break;
                        default:
                            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                                config: PROMPT_CONFIG.ERROR,
                                iconSvg: SHAPE_ICON,
                                content:
                                    I18N_STRINGS.server_internal_error_format?.format(
                                        JSON.parse(xhr.responseText).msg
                                    ),
                                timeout: 5000,
                            });
                    }
                    return;
                }

                const info = JSON.parse(xhr.responseText);
                if (info.net_nodes_shape === undefined) {
                    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                        config: PROMPT_CONFIG.ERROR,
                        iconSvg: SHAPE_ICON,
                        content: I18N_STRINGS.server_return_unexpected,
                        timeout: 5000,
                    });
                    return;
                }

                // only one node
                if (info.net_nodes_shape.length !== 1) {
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
                        "[ShapeCalculate] calculation failed at",
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

                // update shapeInfo
                let calcMsg = info.net_nodes_msg[0];
                if (calcMsg !== null) {
                    console.debug(
                        `[ShapeCalculate] calculation return msg as ${calcMsg} at`,
                        node
                    );
                }
                node.outputEndpointShapeInfo = calcMsg;

                push();
            };

            const layerNode = new LayerNode(node.config.apiName);
            // let from_data as null
            layerNode.from_data = new Array(node.inputEndpoint.length).fill(
                null
            );
            layerNode.args = node.getArgs();
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

    function tidyNodes() {
        // base on node.prevNodes(set): prevNode
        // base on node.inputEndpointPrev(array): Point(prevNode.id, prevNode.endpointIdx)
        // base on node.id
        // but no change it!!
        let allNodes = [];

        // step1: establish graph data structure
        const canvasEle = document.getElementById("canvas");
        for (let ptr = canvasEle.children.length - 1; ptr >= 0; ptr--) {
            const element = canvasEle.children[ptr];
            const elementClassName = String(element?.className);
            if (!elementClassName.includes("node")) continue;

            const node = element.origin;
            allNodes.push(node);
        }

        // nextNodes(Map): node.id->Set(nextNode,...)
        function buildNextNodes(nodes) {
            const nextNodes = new Map();
            for (const node of nodes) {
                nextNodes.set(node.id, new Set());
            }
            for (const node of nodes) {
                for (const prevNode of node.prevNodes) {
                    nextNodes.get(prevNode.id).add(node);
                }
            }
            return nextNodes;
        }
        const nextNodes = buildNextNodes(allNodes);

        // prevNodes(Map): node.id -> Set(prevNode,...)
        function buildPrevNodes(nodes) {
            const prevNodes = new Map();
            for (const node of nodes) {
                const prevNode = new Set();
                for (const prev of node.prevNodes) {
                    prevNode.add(prev);
                }
                prevNodes.set(node.id, prevNode);
            }
            return prevNodes;
        }
        const prevNodes = buildPrevNodes(allNodes);

        // prevNodeEndpoints(Map): node.id->[[node.id,endpointIdx]|null, ...]*inputEndpointCount
        function buildPrevNodeEndpoints(nodes) {
            const prevNodeEndpoints = new Map();
            for (const node of nodes) {
                const prevNodeEndpoint = [];
                for (const point of node.inputEndpointPrev) {
                    if (point == null) {
                        prevNodeEndpoint.push(null);
                        continue;
                    }
                    prevNodeEndpoint.push([point.nodeId, point.endpointIdx]);
                }
                prevNodeEndpoints.set(node.id, prevNodeEndpoint);
            }
            return prevNodeEndpoints;
        }
        const prevNodeEndpoints = buildPrevNodeEndpoints(allNodes);

        const uselessNodes = []; // not connection, push to same pile
        const graphNodes = [];
        for (const node of allNodes) {
            if (
                nextNodes.get(node.id).size === 0 &&
                prevNodes.get(node.id).size === 0
            ) {
                uselessNodes.push(node);
            } else {
                graphNodes.push(node);
            }
        }

        // step2: check if exist loop
        const nodeVisitStatus = new Map(); // node.id->status
        const visitCode = {
            visiting: 0,
            finish: 1,
        };
        function existLoop(u) {
            nodeVisitStatus.set(u.id, visitCode.visiting);
            for (const v of prevNodes.get(u.id)) {
                switch (nodeVisitStatus.get(v.id)) {
                    case visitCode.visiting:
                        return true;
                    case visitCode.finish:
                        break;
                    default:
                        if (existLoop(v)) {
                            return true;
                        }
                }
            }
            nodeVisitStatus.set(u.id, visitCode.finish);
            return false;
        }
        for (const u of graphNodes) {
            if (existLoop(u)) {
                console.warn("[TidyNodes] loop found!", graphNodes);
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.WARNING,
                    iconSvg: TIDY_NODES_ICON,
                    content: I18N_STRINGS.loop_found_cannot_tidy,
                    timeout: 5000,
                });
                return;
            }
        }

        // step3.1: confirm rank of nodes
        const nodeRank = new Map(); // node.id->rank
        let maxRank = 0;
        function calcRank(u) {
            if (nodeRank.has(u.id)) return nodeRank.get(u.id);
            let rank = 0;
            for (const v of nextNodes.get(u.id)) {
                rank = Math.max(rank, calcRank(v) + 1);
            }
            nodeRank.set(u.id, rank);
            return rank;
        }
        for (const u of graphNodes) {
            // input/data node first do push
            if (prevNodes.get(u.id).size === 0) {
                maxRank = Math.max(maxRank, calcRank(u));
            }
        }
        if (nodeRank.size !== graphNodes.length) {
            console.error(
                "[TidyNodes] can't calculate the rank of nodes!",
                graphNodes
            );
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.WARNING,
                iconSvg: TIDY_NODES_ICON,
                content: I18N_STRINGS.node_rank_calc_error,
                timeout: 5000,
            });
            return;
        }
        // input node push to top
        for (const u of graphNodes) {
            // input/data node first do push
            if (prevNodes.get(u.id).size === 0) {
                nodeRank.set(u.id, maxRank);
            }
        }

        // step3.2: patching skip connection
        // remember only to change nextNodes
        let fakeNodeIdCounter = 0;
        const newFakeNode = (
            prevNode,
            outputEndpointIdx,
            rank,
            addNextNodes = true
        ) => {
            const node = {};
            node.id = `f${fakeNodeIdCounter++}`;

            // add to nextNodes
            if (addNextNodes) {
                nextNodes.get(prevNode.id).add(node);
            }

            // add to prevNodes
            prevNodes.set(node.id, new Set());
            prevNodes.get(node.id).add(prevNode);

            // add prevNodeEndpoints
            prevNodeEndpoints.set(node.id, [[prevNode.id, outputEndpointIdx]]);

            // set rank
            nodeRank.set(node.id, rank);

            node.fakeNode = true;
            nextNodes.set(node.id, new Set());
            node.redraw = () => {
                // do nothing
            };

            return node;
        };
        const addFakeNodes = [];
        for (const u of graphNodes) {
            const uRank = nodeRank.get(u.id);
            const needDeleteNextNodes = [],
                needAddNextNode = [];
            for (const v of nextNodes.get(u.id)) {
                const vRank = nodeRank.get(v.id);
                if (uRank === vRank + 1) continue;

                const connectEndpointInfo = []; // inputEndpointIdx(v), outputEndpointIdx(u)
                for (const [inputEndpointIdx, pointInfo] of prevNodeEndpoints
                    .get(v.id)
                    .entries()) {
                    if (pointInfo == null) continue;
                    const [outputNodeId, outputEndpointIdx] = pointInfo;
                    if (outputNodeId === u.id) {
                        connectEndpointInfo.push([
                            inputEndpointIdx,
                            outputEndpointIdx,
                        ]);
                    }
                }
                // impossible
                if (connectEndpointInfo.length === 0) {
                    throw "Can't found a prevNode in a connection, please contact us!";
                }

                // new fakeNodes
                const prevFakeNodes = [];
                for (const [_, outputEndpointIdx] of connectEndpointInfo) {
                    const fakeNode = newFakeNode(
                        u,
                        outputEndpointIdx,
                        uRank - 1,
                        false // not add to u.nextNodes now
                    );
                    addFakeNodes.push(fakeNode);
                    prevFakeNodes.push(fakeNode);
                    needAddNextNode.push(fakeNode);
                }

                const vPrevNodes = prevNodes.get(v.id);
                // delete v.prevNodes
                vPrevNodes.delete(u);
                // delete u.nextNodes
                needDeleteNextNodes.push(v);

                let curRank = uRank - 2;
                while (curRank > vRank) {
                    for (const [idx, prevFakeNode] of prevFakeNodes.entries()) {
                        const fakeNode = newFakeNode(prevFakeNode, 0, curRank);
                        addFakeNodes.push(fakeNode);
                        prevFakeNodes[idx] = fakeNode;
                    }
                    curRank--;
                }

                // set v.prevNodes v.prevNodeEndpoints fakeNodes.nextNodes
                for (const [idx, fakeNode] of prevFakeNodes.entries()) {
                    const [inputEndpointIdx, _] = connectEndpointInfo[idx];
                    vPrevNodes.add(fakeNode);
                    prevNodeEndpoints.get(v.id)[inputEndpointIdx] = [
                        fakeNode.id,
                        0,
                    ];
                    nextNodes.get(fakeNode.id).add(v);
                }
            }
            // delete nextNodes
            const uNextNodes = nextNodes.get(u.id);
            for (const node of needDeleteNextNodes) {
                uNextNodes.delete(node);
            }

            // add nextNodes
            for (const node of needAddNextNode) {
                uNextNodes.add(node);
            }
        }
        // push to graphNodes
        for (const node of addFakeNodes) {
            graphNodes.push(node);
        }
        console.debug(`[TidyNodes] add ${fakeNodeIdCounter} fake node.`);

        // step3.3: layer nodes
        let nodeLayers = [];
        for (let i = 0; i <= maxRank; i++) {
            nodeLayers.push([]);
        }
        for (const node of graphNodes) {
            nodeLayers[nodeRank.get(node.id)].push(node);
        }
        console.debug("[TidyNodes] calculate node rank success.", nodeLayers);

        // step4: sort layers
        const sameLengthArrayCompare = (a, b) => {
            const n = a.length;
            // impossible
            if (b.length !== n) {
                throw "Get a unexpect array information, please contact us!";
            }
            for (const [idx, val] of a.entries()) {
                if (b[idx] !== val) {
                    return a[idx] - b[idx];
                }
            }
            return 0;
        };
        const dirsInfo = {
            up: {
                // output->input
                start: (n) => {
                    return 0;
                },
                check: (i, n) => {
                    return i < n;
                },
                next: (i) => {
                    return i + 1;
                },
                getOrders: (node, prevLayerNodesOrder) => {
                    // check inputEndpoint
                    const orders = [];
                    for (const [_, info] of prevLayerNodesOrder) {
                        const [prevNode, order] = info;
                        for (const [
                            inputEndpointIdx,
                            point,
                        ] of prevNodeEndpoints.get(prevNode.id).entries()) {
                            if (point == null) continue;
                            const [nodeId, _] = point;
                            if (nodeId === node.id) {
                                orders.push([order, inputEndpointIdx]);
                            }
                        }
                    }
                    orders.sort(sameLengthArrayCompare);
                    return orders;
                },
            },
            down: {
                // input->output
                start: (n) => {
                    return n - 1;
                },
                check: (i, n) => {
                    return i >= 0;
                },
                next: (i) => {
                    return i - 1;
                },
                getOrders: (node, prevLayerNodesOrder) => {
                    // check outputEndpoint
                    const orders = [];
                    for (const point of prevNodeEndpoints.get(node.id)) {
                        if (point == null) continue;
                        const [nodeId, outputEndpoint] = point;
                        if (!prevLayerNodesOrder.has(nodeId)) continue;
                        const [_, order] = prevLayerNodesOrder.get(nodeId);
                        orders.push([order, outputEndpoint]);
                    }
                    orders.sort(sameLengthArrayCompare);
                    return orders;
                },
            },
        };
        const getCrossCount = (uOrders, vOrders) => {
            let res = 0;
            const uN = uOrders.length,
                vN = vOrders.length;
            for (let uPtr = 0, vPtr = 0; uPtr < uN && vPtr < vN; vPtr++) {
                while (uPtr < uN && uOrders[uPtr] <= vOrders[vPtr]) {
                    uPtr++;
                }
                if (uPtr >= uN) break;
                res += uN - uPtr;
            }
            return res;
        };
        const getNodePrevOrders = (layer, prevLayerNodesOrder, getOrders) => {
            const nodePrevOrders = new Map(); // node.id->orders
            for (const node of layer) {
                const nodePrevOrder = getOrders(node, prevLayerNodesOrder);
                nodePrevOrders.set(node.id, nodePrevOrder);
            }
            return nodePrevOrders;
        };
        const getWeight = (order) => {
            const [nodeIdx, endpointIdx] = order;
            return nodeIdx * TIDY_NODES_MAX_ENDPOINT_COUNT + endpointIdx;
        };
        const calcWeight = (orders) => {
            const m = orders.length,
                half = Math.floor(m / 2);
            if (m === 0) {
                return -1;
            } else if (m % 2 === 1) {
                return getWeight(orders[half]);
            }
            return (getWeight(orders[half]) + getWeight(orders[half - 1])) / 2;
        };
        const getWeights = (nodePrevOrders) => {
            const weights = new Map(); // node.id->weight
            for (const [nodeId, nodePrevOrder] of nodePrevOrders) {
                weights.set(nodeId, calcWeight(nodePrevOrder));
            }
            return weights;
        };
        const orderedArrayUpperBound = (array, val, cmp) => {
            const m = array.length;
            if (m === 0) return 0;
            let l = 0,
                r = m - 1;
            while (l < r) {
                let mid = (l + r) >> 1;
                if (cmp(val, array[mid]) >= 0) {
                    l = mid + 1;
                } else {
                    r = mid;
                }
            }
            if (cmp(val, array[l]) >= 0) l++; // l<-m
            return l;
        };
        const orderedArrayPush = (array, val, cmp) => {
            // in any case it is O(n)
            array.push(val);
            const m = array.length;
            for (let i = m - 1; i > 0; i--) {
                if (cmp(array[i - 1], array[i]) > 0) {
                    const tmp = array[i];
                    array[i] = array[i - 1];
                    array[i - 1] = tmp;
                } else {
                    break;
                }
            }
        };
        const getLayersCrossCount = (layers) => {
            let result = 0;
            const prevLayerNodesOrder = new Map(); // node.id->(node,j)

            for (const [_, layer] of layers.entries()) {
                const prevOrders = [];
                for (const [_, node] of layer.entries()) {
                    const orders = dirsInfo.up.getOrders(
                        node,
                        prevLayerNodesOrder
                    );

                    for (const order of orders) {
                        result +=
                            prevOrders.length -
                            orderedArrayUpperBound(
                                prevOrders,
                                order,
                                sameLengthArrayCompare
                            );
                        // self order will not change the bound, because orders is ordered.
                        orderedArrayPush(
                            prevOrders,
                            order,
                            sameLengthArrayCompare
                        );
                    }
                }

                // update prevLayerNodesOrder
                prevLayerNodesOrder.clear();
                for (const [j, node] of layer.entries()) {
                    prevLayerNodesOrder.set(node.id, [node, j]);
                }
            }
            return result;
        };
        const isBetter = (baseLayers, currentLayer) => {
            return (
                getLayersCrossCount(baseLayers) >
                getLayersCrossCount(currentLayer)
            );
        };
        const copyLayers = (layers) => {
            const newLayers = [];
            for (const layer of layers) {
                const newLayer = [];
                newLayer.push(...layer);
                newLayers.push(newLayer);
            }
            return newLayers;
        };
        function optimize(layers, dir) {
            const n = layers.length;

            const prevLayerNodesOrder = new Map(); // node.id->(node,j)
            for (let i = dir.start(n); dir.check(i, n); i = dir.next(i)) {
                const layer = layers[i];

                // get prevNodeOrders
                const nodePrevOrders = getNodePrevOrders(
                    layer,
                    prevLayerNodesOrder,
                    dir.getOrders
                );

                // get weights
                const weights = getWeights(nodePrevOrders); // node.id->weight

                // sort this layer
                layer.sort((u, v) => weights.get(u.id) - weights.get(v.id));

                // fine tuning
                const m = layer.length;
                for (let j = 1; j < m; j++) {
                    const u = layer[j],
                        v = layer[j - 1];
                    const uPrevOrder = nodePrevOrders.get(u.id);
                    const vPrevOrder = nodePrevOrders.get(v.id);

                    // (v,u) -?> (u,v)
                    if (
                        getCrossCount(vPrevOrder, uPrevOrder) >
                        getCrossCount(uPrevOrder, vPrevOrder)
                    ) {
                        layer[j] = v;
                        layer[j - 1] = u;
                    }
                }
                for (let j = m - 2; j >= 0; j--) {
                    const u = layer[j],
                        v = layer[j + 1];
                    const uPrevOrder = nodePrevOrders.get(u.id);
                    const vPrevOrder = nodePrevOrders.get(v.id);

                    // (u,v) -?> (v,u)
                    if (
                        getCrossCount(uPrevOrder, vPrevOrder) >
                        getCrossCount(vPrevOrder, uPrevOrder)
                    ) {
                        layer[j] = v;
                        layer[j + 1] = u;
                    }
                }

                // update prevLayerNodesOrder
                prevLayerNodesOrder.clear();
                for (const [j, node] of layer.entries()) {
                    prevLayerNodesOrder.set(node.id, [node, j]);
                }
            }
        }
        console.debug(
            "[TidyNodes] begin to sort layers, current layers is",
            nodeLayers
        );
        let tryTime = 0;
        while (tryTime < TIDY_NODES_MAX_ITERATIONS) {
            let currentNodeLayers = copyLayers(nodeLayers);

            optimize(currentNodeLayers, dirsInfo.up);

            if (!isBetter(nodeLayers, currentNodeLayers)) {
                currentNodeLayers = copyLayers(nodeLayers);
                optimize(currentNodeLayers, dirsInfo.down);
                if (!isBetter(nodeLayers, currentNodeLayers)) {
                    break;
                }
            }
            nodeLayers = currentNodeLayers;
            tryTime += 1;
        }
        if (tryTime === TIDY_NODES_MAX_ITERATIONS) {
            console.warn("[TidyNodes] sort layers timeout!", nodeLayers);
        } else {
            console.debug(
                `[TidyNodes] sort layers success at ${tryTime + 1} times.`,
                nodeLayers
            );
        }
        console.debug(
            `[TidyNodes] cross point = ${getLayersCrossCount(nodeLayers)}.`
        );

        // step5.1: place graph nodes
        //      base on: each child tree is disjointed
        const moveNodes = [];
        const nodeInDeg = new Map();
        for (const u of graphNodes) {
            for (const v of nextNodes.get(u.id)) {
                const prevInDeg = nodeInDeg.get(v.id);
                nodeInDeg.set(v.id, (prevInDeg ? prevInDeg : 0) + 1);
            }
        }
        const placeOrders = new Map(); // node.id->(rank,order)
        for (const [rank, layer] of nodeLayers.entries()) {
            for (const [order, node] of layer.entries()) {
                placeOrders.set(node.id, [rank, order]);
            }
        }
        const nextNodeCompare = (u, v) => {
            // rank more big means the node is near by input, more early to consider.
            // order more small means the node is near by left, more early to consider.
            const [uRank, uOrder] = placeOrders.get(u.id);
            const [vRank, vOrder] = placeOrders.get(v.id);
            if (uRank === vRank) {
                return uOrder - vOrder;
            }
            return vRank - uRank;
        };
        function drawGraph(root, leftOffset) {
            const nodeCoordinates = new Map(); // node->[left,top]
            // step1: place
            function placeNode(u, leftOffset) {
                // consider a scene:
                //      v in nextNodes.get(u), and rand(v')==rand(v), order(v')<order(v)
                //  then v' hasn't been placed. order(v') order(v) are based on less
                //  cross point count, and we traverse next nodes in the order of rank and
                //  rank's order.
                //  so: 1. v' in nextNodes.get(u): v' not placed is impossibility
                //      2. v' not in nextNodes.get(u):
                //          1. v' in u' which has same rank and bigger order to u
                //                  based on less cross point count, we can say (u',u) is
                //              better then (u,u'), so it is impossibility.
                //          2. v' in u' which has same rank and smaller order to u
                //                  v' not placed is impossibility
                //  after all, we get: (v' in nextNodes.get(u)) xor (v' placed) is true.
                // if (nodePlaced.has(u.id)) return 0;

                const [rank, _] = placeOrders.get(u.id);
                const uNextNodes = [...nextNodes.get(u.id)]; // array
                uNextNodes.sort(nextNodeCompare);
                const top =
                    (maxRank - rank) * TIDY_NODES_ROOT_NODE_TOP_PLACE_INTERVAL;

                // output node
                if (uNextNodes.length === 0) {
                    const width = u.element.offsetWidth;
                    nodeCoordinates.set(u, [leftOffset, top]);
                    return width;
                }

                let graphOffset = leftOffset;
                let accessCounter = 0;
                let left = -1;
                for (const v of uNextNodes) {
                    // calculate when the last time check a node.
                    nodeInDeg.set(v.id, nodeInDeg.get(v.id) - 1);
                    if (nodeInDeg.get(v.id) !== 0) continue;

                    const cWidth = placeNode(v, graphOffset);
                    graphOffset += cWidth;
                    if (v.fakeNode === true) {
                        left = graphOffset - TIDY_NODES_NODE_WIDTH;
                    }
                    // add interval
                    graphOffset += TIDY_NODES_ROOT_NODE_SUB_GRAPH_INTERVAL;
                    accessCounter++;
                }

                let width = graphOffset - leftOffset;
                if (accessCounter) {
                    // delete needless interval
                    width -= TIDY_NODES_ROOT_NODE_SUB_GRAPH_INTERVAL;
                } else {
                    // add self width
                    width += TIDY_NODES_NODE_WIDTH;
                }
                // no fake node, we tend to set to right
                if (left === -1) {
                    left = leftOffset + width - TIDY_NODES_NODE_WIDTH;
                }
                nodeCoordinates.set(u, [left, top]);
                return width;
            }

            placeNode(root, leftOffset);

            // step2: reshape
            // step2.1: delete blank
            let minLeft = Number.MAX_SAFE_INTEGER;
            for (const [_, coordinates] of nodeCoordinates) {
                const [left, _] = coordinates;
                minLeft = Math.min(minLeft, left);
            }
            for (const [_, coordinates] of nodeCoordinates) {
                coordinates[0] = coordinates[0] - minLeft + leftOffset;
            }

            // step3: redraw
            for (const [node, coordinates] of nodeCoordinates) {
                const prevCoordinates = node.getCoordinates?.();
                node.redraw(...coordinates);
                // fake nodes
                if (prevCoordinates) {
                    moveNodes.push({
                        node,
                        prevX: prevCoordinates.left,
                        prevY: prevCoordinates.top,
                        curX: coordinates[0],
                        curY: coordinates[1],
                    });
                }
            }

            // step4: get width
            let minL = Number.MAX_SAFE_INTEGER,
                maxL = Number.MIN_SAFE_INTEGER;
            for (const [_, coordinates] of nodeCoordinates) {
                const [left, _] = coordinates;
                minL = Math.min(minLeft, left);
                maxL = Math.max(maxL, left);
            }
            console.debug(
                "[TidyNodes] place a graph successfully!",
                nodeCoordinates
            );

            return maxL - minL;
        }
        let offset = 0;
        for (const node of nodeLayers.at(-1)) {
            offset +=
                drawGraph(node, offset) + TIDY_NODES_ROOT_NODE_GRAPH_INTERVAL;
        }

        // step5.2: place useless nodes
        let top = 0,
            left = -TIDY_NODES_ROOT_NODE_GRAPH_INTERVAL;
        for (const node of uselessNodes) {
            const prevCoordinates = node.getCoordinates();
            node.redraw(left, top);
            moveNodes.push({
                node,
                prevX: prevCoordinates.left,
                prevY: prevCoordinates.top,
                curX: left,
                curY: top,
            });
            top += node.element.offsetHeight;
        }

        // step5.3: record move operation
        MESSAGE_PUSH(MESSAGE_TYPE.OperationSave, { moveNodes });
    }

    window.createJsPlumbConnectionListener = (jsPlumbInstance) => {
        /**
         * using to:
         *      1. update targetNode.inputEndpointPrev
         *      2. update sourceNode.outputEndpointConnection
         *      3. push shape
         *      4. update targetNode.prevNodes
         *      5. update sourceNode.connections
         *      6. update targetNode.connections
         *      7. call undo-helper
         */
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
            targetNode.prevNodes.add(sourceNode);
            const connectionKey = getConnectionKey(
                sourceNode.id,
                srcEndpointIdx,
                targetNode.id,
                tarEndpointIdx
            );
            sourceNode.connections.set(connectionKey, {
                connection: connection,
                src: sourceNode,
                tar: targetNode,
                srcEndpointIdx,
                tarEndpointIdx,
            });
            targetNode.connections.set(connectionKey, {
                connection: connection,
                src: sourceNode,
                tar: targetNode,
                srcEndpointIdx,
                tarEndpointIdx,
            });

            // push shape if current node is ready or error
            if (sourceNode.outputEndpointShape[srcEndpointIdx] !== NOT_SHAPE) {
                // get shape
                let shape = sourceNode.outputEndpointShape[srcEndpointIdx];

                // push to connection
                addShapeToConnection(
                    connection,
                    shape,
                    sourceNode.outputEndpointShapeInfo
                );

                // shape.length === 0 mean this node get a error shape,
                targetNode.inputEndpointShape[tarEndpointIdx] =
                    shape === ERROR_RESULT_SHAPE ? NOT_SHAPE : shape.concat();
            }
            pushShape(targetNode);

            const ignores = MEMORY_GET(MEMORY_KEYS.ConnectionCreateIgnore);
            if (ignores?.has(connectionKey)) {
                ignores.delete(connectionKey);
            } else {
                MESSAGE_CALL(MESSAGE_TYPE.OperationSave, {
                    createConnections: [
                        {
                            src: sourceNode,
                            srcEndpointIdx,
                            tar: targetNode,
                            tarEndpointIdx,
                        },
                    ],
                });
            }

            console.info(
                `[Connection] node${sourceNode.id}@out${srcEndpointIdx} -> node${targetNode.id}@in${tarEndpointIdx}`
            );
        });

        /**
         * using to:
         *      1. delete targetNode.inputEndpointPrev
         *      2. delete targetNode.inputEndpointShape
         *      3. clear shape
         *      4. update targetNode.prevNodes
         *      5. update sourceNode.connections
         *      6. update targetNode.connections
         *      7. call undo-helper
         */
        const deleteConnection = (info) => {
            // info {
            //      source
            //      target
            //      sourceEndpoint
            //      targetEndpoint
            //      connection
            // }
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
            // update targetNode.prevNodes
            let foundAnotherSrcNode = false;
            for (const point of targetNode.inputEndpointPrev) {
                if (point?.nodeId === sourceNode.id) {
                    foundAnotherSrcNode = true;
                }
            }
            if (!foundAnotherSrcNode) {
                targetNode.prevNodes.delete(sourceNode);
            } else {
                console.debug(
                    "[ConnectionDetach] found another connection from sourceNode to targetNode",
                    sourceNode,
                    targetNode
                );
            }
            const connectionKey = getConnectionKey(
                sourceNode.id,
                srcEndpointIdx,
                targetNode.id,
                tarEndpointIdx
            );
            sourceNode.connections.delete(connectionKey);
            targetNode.connections.delete(connectionKey);

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

            const ignores = MEMORY_GET(MEMORY_KEYS.ConnectionDeleteIgnore);
            if (ignores?.has(connectionKey)) {
                ignores.delete(connectionKey);
            } else {
                MESSAGE_CALL(MESSAGE_TYPE.OperationSave, {
                    deleteConnections: [
                        {
                            src: sourceNode,
                            srcEndpointIdx,
                            tar: targetNode,
                            tarEndpointIdx,
                        },
                    ],
                });
            }

            console.info(
                `[Connection] node${sourceNode.id}@out${srcEndpointIdx} -X-> node${targetNode.id}@in${tarEndpointIdx}`
            );
        };

        jsPlumbInstance.bind("connection:move", (info) => {
            info.source = info.connection.source;
            info.target = info.originalEndpoint.element;
            info.sourceEndpoint = info.connection.endpoints[0];
            info.targetEndpoint = info.originalEndpoint;
            deleteConnection(info);
        });

        jsPlumbInstance.bind("connection:detach", deleteConnection);

        /**
         * using to:
         *      1. check if the new adding edge will introduce a loop
         */
        jsPlumbInstance.bind("beforeDrop", function (info) {
            const sourceNode = info.connection.source.origin;
            const targetNode = info.connection.target.origin;

            // check loop
            const meetNodeIds = new Set();
            const targetId = targetNode.id;
            function canArrive(node) {
                meetNodeIds.add(node.id);
                if (node.id === targetId) {
                    return true;
                }
                for (const nextNode of node.prevNodes) {
                    if (meetNodeIds.has(nextNode)) continue;
                    if (canArrive(nextNode)) return true;
                }
                return false;
            }

            if (canArrive(sourceNode)) {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                    title: I18N_STRINGS.error,
                    text: I18N_STRINGS.connection_causes_loop,
                    buttonMode: COVERING_BUTTON_MODE.CloseButton,
                });
                console.warn("[GraphChecker]", "Loop");
                return false;
            }

            return true;
        });
    };

    window.createGraphListener = (jsPlumbNavigator) => {
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

            add2Logger(I18N_STRINGS.network_calculating);

            const calc = () => {
                const graph = calculate(canvasEle);
                if (
                    graph === null ||
                    graph.input_nodes.length === 0 ||
                    graph.net_nodes.length === 0 ||
                    graph.output_nodes.length === 0
                ) {
                    add2Logger(I18N_STRINGS.impossible_network);
                    return;
                } else {
                    add2Logger(I18N_STRINGS.network_calculation_finish);
                }

                const xhr = new XMLHttpRequest();
                const url = `/model/calculate/${MEMORY_GET(
                    MEMORY_KEYS.CurrentFramework,
                    FRAMEWORK.pytorch
                ).toLowerCase()}`;
                xhr.open("POST", url, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) {
                        return;
                    }

                    if (xhr.status !== 200) {
                        switch (xhr.status) {
                            case 0:
                                add2Logger(I18N_STRINGS.server_disconnect);
                                break;
                            default:
                                add2Logger(
                                    I18N_STRINGS.server_internal_error_format?.format(
                                        JSON.parse(xhr.responseText).msg
                                    )
                                );
                        }
                        return;
                    }

                    const info = JSON.parse(xhr.responseText);
                    add2Logger(
                        I18N_STRINGS.network_analysis_result_format?.format(
                            info.msg
                        )
                    );

                    if (info.fn) {
                        const downloadLink = document.createElement("button");
                        downloadLink.className = "download-button";
                        downloadLink.textContent = I18N_STRINGS.download_code;
                        downloadLink.onclick = () => {
                            window.open(`/model/download/${info.fn}`, "_blank");
                            return false;
                        };
                        loggerEle.appendChild(downloadLink);
                    } else {
                        add2Logger(I18N_STRINGS.no_file_return_from_server);
                    }
                };
                add2Logger(I18N_STRINGS.init_network_analysis);
                xhr.send(
                    JSON.stringify({
                        timestamp: new Date().getDate(),
                        data: JSON.stringify(graph),
                        name: null,
                    })
                );
            };

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                title: I18N_STRINGS.calculate,
                elements: [loggerEle],
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
                afterInit: calc,
            });
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

        MESSAGE_HANDLER(MESSAGE_TYPE.TidyNodes, (event) => {
            const tidy = (needCovering = true) => {
                // in any case, do not crash.
                try {
                    tidyNodes();
                } catch (err) {
                    console.error("[TidyNodes] failed.", err);
                    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                        config: PROMPT_CONFIG.ERROR,
                        iconSvg: TIDY_NODES_ICON,
                        content: I18N_STRINGS.tidy_nodes_fail,
                        timeout: 5000,
                    });
                }
                setTimeout(() => {
                    if (needCovering) {
                        MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                    }
                    MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
                }, 0);
            };

            if (event.detail?.notNeedCovering) {
                tidy(false);
            } else {
                MESSAGE_CALL(MESSAGE_TYPE.CoveringShow, {
                    title: I18N_STRINGS.tiding_nodes,
                    afterInit: tidy,
                });
            }
        });
    };
})();
