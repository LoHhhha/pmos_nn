/**
 * MESSAGE_TYPE.ClearNode
 *
 * MESSAGE_TYPE.CreateNode
 *      <event.detail.nodesInfo: Array> <event.detail.connectionsInfo: Array> [<event.detail.offsetLeft: int> <event.detail.offsetTop: int>]
 *          <event.detail.nodesInfo>: [{config, left, top, content}]
 *          <event.detail.connectionsInfo> [{srcNodeIdx, srcEndpointIdx, tarNodeIdx, tarEndpointIdx}]
 *          -> node
 *
 */

const rootStyle = getComputedStyle(document.querySelector(":root"));
rootStyle.var = (key) => rootStyle.getPropertyValue(key);

let MAX_Z_INDEX = 0;
let NODE_COUNT = 0;
let ENDPOINT_COUNT = 0;

function getNextZIndex() {
    return MAX_Z_INDEX++;
}

function getNextNodeId() {
    return NODE_COUNT++;
}

function getNextEndpointId() {
    return ENDPOINT_COUNT++;
}

function getNodeElement(config) {
    const node = document.createElement("div");
    node.classList.add(operatorBarNamespace.baseNodeCssClass);
    for (const x of config.extendCssClass) {
        node.classList.add(x);
    }
    node.textContent = config.apiName;
    return node;
}

class Overview {
    static #overviewInstance = null;

    element;
    viewport;
    isShow;

    constructor(jsPlumbNavigator, options) {
        if (Overview.#overviewInstance !== null) {
            return Overview.#overviewInstance;
        }
        this.viewport = jsPlumbNavigator.viewportEle;

        const { nodeOverviewPosition } = options;
        this.element = document.createElement("div");
        this.element.classList.add("overview");
        const margin = rootStyle.var("--node-overview-margin");
        switch (nodeOverviewPosition) {
            case "top-left":
                this.element.style.left = margin;
                this.element.style.top = margin;
                break;
            case "top-right":
                this.element.style.right = margin;
                this.element.style.top = margin;
                break;
            case "bottom-left":
                this.element.style.left = margin;
                this.element.style.bottom = margin;
                break;
            default:
                this.element.style.right = margin;
                this.element.style.bottom = margin;
                break;
        }
        this.viewport.appendChild(this.element);
        this.hide();
        return (Overview.#overviewInstance = this);
    }

    show(node) {
        if (this.isShow) {
            console.error(
                "[Node-Overview] detect a overview show call when another node showing its overview!"
            );
            return;
        }
        this.isShow = true;

        // title
        const title = document.createElement("div");
        title.classList.add("overview-title");
        const link = document.createElement("a");
        if (node.config.link) {
            link.onclick = () => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                    title: "Page Jump!",
                    text: `Go to introduction for ${node.config.apiName} page?`,
                    buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
                    buttonCallback: {
                        confirm: () => {
                            window.open(node.config.link);
                        },
                    },
                });
            };
        }
        link.text = node.config.apiName;
        if (node.config.framework !== operatorBarNamespace.framework.all) {
            link.text += "(" + node.config.framework + ")";
        }
        link.target = "_blank";
        title.appendChild(link);
        this.element.appendChild(title);

        // args
        const argsContainer = document.createElement("div");
        argsContainer.classList.add("overview-args-container");
        for (const arg of node.config.args) {
            const item = document.createElement("div");
            item.classList.add("overview-item");

            const itemName = document.createElement("div");
            itemName.classList.add("overview-item-text");
            itemName.textContent = arg.name;
            item.appendChild(itemName);

            const itemInput = document.createElement(arg.type.input.element);
            itemInput.classList.add("overview-item-input");
            if (arg.type.input.element.type) {
                itemInput.type = arg.type.input.element.type;
            }
            switch (arg.type.input) {
                case operatorBarNamespace.argsInputType.text:
                    itemInput.onchange = () => {
                        console.log(
                            itemInput.value,
                            arg.type.reg,
                            arg.type.reg.test(itemInput.value),
                            itemInput.value,
                            arg.type.reg,
                            arg.type.reg.test(itemInput.value)
                        );
                        if (arg.type.reg.test(itemInput.value)) {
                            node.content[arg.name] = itemInput.value;
                        } else {
                            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                                title: "Warning!",
                                text: arg.type.note,
                                buttonMode: COVERING_BUTTON_MODE.CloseButton,
                            });
                            itemInput.value = arg.default;
                            node.content[arg.name] = arg.default;
                        }
                        node.updateOutline();
                    };
                    break;
                case operatorBarNamespace.argsInputType.select:
                    for (const value of arg.type.values) {
                        const selectEle = document.createElement("option");
                        selectEle.value = value;
                        selectEle.textContent = value;
                        itemInput.appendChild(selectEle);
                    }

                    itemInput.onchange = () => {
                        node.content[arg.name] = itemInput.value;
                        node.updateOutline();
                    };
                    break;
                default:
                    console.error(
                        "[operator-bar] get a nonsupport input type: ${arg.type.input}."
                    );
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                        title: "Error!",
                        text: `Found nonsupport input type: ${arg.type.input}, please report to us.`,
                        buttonMode: COVERING_BUTTON_MODE.CloseButton,
                    });
            }
            itemInput.value = node.content[arg.name];
            item.appendChild(itemInput);

            argsContainer.appendChild(item);
        }
        this.element.appendChild(argsContainer);

        const hideOverview = () => {
            // point down beyond the overview
            this.hide();
            node.updateOutline();
            node.hideOverview = null;
        };
        node.hideOverview = hideOverview.bind(this);

        // button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("overview-delete-button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            this.hide();
            node.dispose();
        });
        this.element.appendChild(deleteButton);
    }

    hide() {
        this.isShow = false;
        while (this.element.firstChild) {
            this.element.removeChild(this.element.lastChild);
        }
    }
}

class Node {
    id;
    element; // element.origin -> this
    config;
    content;
    canvas;
    viewport;
    jsPlumbInstance;
    outputEndpoint;
    inputEndpoint;
    inputEndpointPrev; // update at graph
    outline;

    // static method
    static SELECTED_NODES = new Set();
    static clearSelect() {
        for (const node of Node.SELECTED_NODES) {
            node.unSelect(); // unSelect will delete itself from SELECTED_NODES.
        }
    }
    static selectNode(node, control) {
        if (control) {
            if (Node.SELECTED_NODES.has(node)) {
                // unselect when select again
                node.unSelect();
            } else {
                // select
                Node.SELECTED_NODES.add(node);
                node.select(false);
            }
        } else {
            // clear if node not selected and select it
            if (!Node.SELECTED_NODES.has(node)) {
                Node.clearSelect();
            }
            Node.SELECTED_NODES.add(node);
            node.select(true);
        }
    }

    updateOutline() {
        var outlineText = "";
        for (const { name, short } of this.config.outlines) {
            if (outlineText !== "") {
                outlineText += " ";
            }
            outlineText += `${short}:${String(this.content[name])}`;
        }
        this.outline.textContent = outlineText;
        if (this.config.changeCallBack instanceof Function) {
            this.config.changeCallBack(this);
        }
    }

    upZIndex() {
        this.element.style.zIndex = getNextZIndex();
    }

    pointerDownHandler(e) {
        this.upZIndex();
        if (e.button == 0) {
            Node.selectNode(this, e.ctrlKey);
        }
    }
    pointerDownHandlerFunc = this.pointerDownHandler.bind(this);

    hideOverview = null;
    showOverview() {
        new Overview().show(this);
    }

    setHandle() {
        // make sure being top
        this.element.addEventListener(
            "pointerdown",
            this.pointerDownHandlerFunc
        );

        // overview
        // show when node is being selected.

        // right-key-menu
        this.element.oncontextmenu = (e) => {
            MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
                showLeft: e.clientX,
                showTop: e.clientY,
                items: [
                    {
                        title: "Copy",
                        callback: () => {
                            // if not selected nodes using this node
                            MESSAGE_PUSH(MESSAGE_TYPE.NodesCopy, {
                                nodes: Node.SELECTED_NODES.size
                                    ? Node.SELECTED_NODES
                                    : [this],
                            });
                        },
                    },
                    {
                        title: "Delete",
                        callback: this.dispose.bind(this),
                    },
                ],
            });
            return false;
        };
    }

    constructor(nodeConfig, left, top, jsPlumbNavigator) {
        this.id = getNextNodeId();
        this.config = nodeConfig;
        this.jsPlumbInstance = jsPlumbNavigator.jsPlumbInstance;
        this.canvas = jsPlumbNavigator.canvasEle;
        this.viewport = jsPlumbNavigator.viewportEle;
        this.content = {};
        this.content.default = {};
        this.outputEndpoint = Array(nodeConfig.outputEnd.length);
        this.inputEndpoint = Array(nodeConfig.inputEnd.length);
        this.inputEndpointPrev = Array(nodeConfig.inputEnd.length);

        this.element = getNodeElement(nodeConfig);
        this.element.origin = this;
        const canvasBounds = jsPlumbNavigator.getCanvasBounds();
        // place
        this.element.style.position = "absolute";
        this.element.style.left = `${left - canvasBounds.left}px`;
        this.element.style.top = `${top - canvasBounds.top}px`;

        this.upZIndex();

        // jsPlumb
        jsPlumbNavigator.canvasEle.appendChild(this.element);
        jsPlumbNavigator.jsPlumbInstance.manage(this.element);

        // set inputEndpointPrev
        for (var ptr = 0; ptr < nodeConfig.inputEnd.length; ptr++) {
            this.inputEndpointPrev[ptr] = null;
        }

        // set endpoint
        for (var ptr = 0; ptr < nodeConfig.outputEnd.length; ptr++) {
            const endpointId = getNextEndpointId();
            const placeRate = (ptr + 1) / (nodeConfig.outputEnd.length + 1);

            // endpoint
            this.outputEndpoint[ptr] =
                jsPlumbNavigator.jsPlumbInstance.addEndpoint(this.element, {
                    uuid: endpointId,
                    anchors: [placeRate, 1, 0, 1],
                    ...operatorBarNamespace.outputEndpointDefaultStyle,
                });

            // endpoint label
            const endpointLabel = document.createElement("div");
            endpointLabel.classList.add("node-endpoint-label");
            endpointLabel.textContent = nodeConfig.outputEnd[ptr];
            this.element.appendChild(endpointLabel);
            endpointLabel.style.top = `${endpointLabel.offsetHeight / 2}px`;
            endpointLabel.style.left = `${
                this.element.offsetWidth * placeRate -
                endpointLabel.offsetWidth / 2
            }px`;
        }
        for (var ptr = 0; ptr < nodeConfig.inputEnd.length; ptr++) {
            const endpointId = getNextEndpointId();
            const placeRate = (ptr + 1) / (nodeConfig.inputEnd.length + 1);

            this.inputEndpoint[ptr] =
                jsPlumbNavigator.jsPlumbInstance.addEndpoint(this.element, {
                    uuid: endpointId,
                    anchors: [placeRate, 0, 0, -1],
                    ...operatorBarNamespace.inputEndpointDefaultStyle,
                });

            // endpoint label
            const endpointLabel = document.createElement("div");
            endpointLabel.classList.add("node-endpoint-label");
            endpointLabel.textContent = nodeConfig.inputEnd[ptr];
            this.element.appendChild(endpointLabel);
            endpointLabel.style.bottom = `${
                (endpointLabel.offsetHeight * 4) / 7
            }px`;
            endpointLabel.style.left = `${
                this.element.offsetWidth * placeRate -
                endpointLabel.offsetWidth / 2
            }px`;
        }

        // set content
        for (const arg of this.config.args) {
            this.content[arg.name] = arg.default;
        }

        // set outline
        const outline = document.createElement("span");
        outline.classList.add("node-outline");
        this.element.appendChild(outline);
        this.outline = outline;
        this.updateOutline();

        this.setHandle();
    }

    select(showOverview) {
        this.element.style.outlineColor = rootStyle.var(
            "--node-selected-outline-color"
        );
        this.element.style.outlineWidth = rootStyle.var(
            "--node-selected-outline-width"
        );
        if (showOverview && this.hideOverview === null) {
            this.showOverview(true);
        }
        this.jsPlumbInstance.addToDragSelection(this.element);
    }

    unSelect() {
        this.element.style.outlineColor = rootStyle.var("--node-outline-color");
        this.element.style.outlineWidth = rootStyle.var("--border-width");
        if (this.hideOverview !== null) {
            this.hideOverview();
        }
        this.jsPlumbInstance.removeFromDragSelection(this.element);
        Node.SELECTED_NODES.delete(this);
    }

    dispose() {
        if (this.element) {
            this.unSelect();
            this.jsPlumbInstance.removeAllEndpoints(this.element);
            this.element.removeEventListener(
                "pointerdown",
                this.pointerDownHandlerFunc
            );
            this.element.oncontextmenu = null;
            this.element.remove();
        }
    }
}

class OperatorNode {
    element;
    config;
    static container;
    static jsPlumbNavigator;

    static pointFollowNode = null;

    static deletePointFollowNode() {
        if (OperatorNode.pointFollowNode !== null) {
            document.removeEventListener(
                "pointermove",
                OperatorNode.handleDrag,
                false
            );
            document.removeEventListener(
                "pointerup",
                OperatorNode.handleDragEnd,
                false
            );
            OperatorNode.pointFollowNode?.remove();
            OperatorNode.pointFollowNode = null;
        }
    }

    handleDragStart(e) {
        // left button only
        if (e.buttons !== 1) return false;

        if (OperatorNode.pointFollowNode !== null) {
            OperatorNode.deletePointFollowNode();
        }

        OperatorNode.pointFollowNode = getNodeElement(this.config);
        OperatorNode.pointFollowNode.style.position = "absolute";
        document.body.appendChild(OperatorNode.pointFollowNode);
        OperatorNode.pointFollowNode.origin = this;

        const rect = this.element.getBoundingClientRect();

        OperatorNode.pointFollowNode.offsetX = e.clientX - rect.left;
        OperatorNode.pointFollowNode.offsetY = e.clientY - rect.top;

        OperatorNode.pointFollowNode.style.left = `${rect.left}px`;
        OperatorNode.pointFollowNode.style.top = `${rect.top}px`;

        document.addEventListener(
            "pointermove",
            OperatorNode.handleDrag,
            false
        );
        document.addEventListener(
            "pointerup",
            OperatorNode.handleDragEnd,
            false
        );

        return false;
    }
    handleDragStartFunc = this.handleDragStart.bind(this);

    static handleDrag(e) {
        if (OperatorNode.pointFollowNode === null) {
            console.warn(
                "[OperatorNode] handleDrag found null pointFollowNode"
            );
            OperatorNode.deletePointFollowNode();
            return false;
        }

        e.preventDefault();
        const x = e.clientX - OperatorNode.pointFollowNode.offsetX;
        const y = e.clientY - OperatorNode.pointFollowNode.offsetY;
        OperatorNode.pointFollowNode.style.left = `${x}px`;
        OperatorNode.pointFollowNode.style.top = `${y}px`;
    }

    static handleDragEnd(e) {
        if (OperatorNode.pointFollowNode === null) {
            console.warn(
                "[OperatorNode] handleDragEnd found null pointFollowNode"
            );
            OperatorNode.deletePointFollowNode();
            return false;
        }

        const rect = OperatorNode.container.getBoundingClientRect();
        const barMinX = rect.left;
        const barMaxX = rect.right;
        const barMinY = rect.top;
        const barMaxY = rect.bottom;
        if (
            e.clientX > barMaxX ||
            e.clientX < barMinX ||
            e.clientY > barMaxY ||
            e.clientY < barMinY
        ) {
            const scale = OperatorNode.jsPlumbNavigator.getCanvasScale();
            OperatorNode.pointFollowNode.origin.addNode(
                e.clientX / scale - OperatorNode.pointFollowNode.offsetX,
                e.clientY / scale - OperatorNode.pointFollowNode.offsetY
            );
        }

        OperatorNode.deletePointFollowNode();
    }

    addNode(left, right) {
        new Node(this.config, left, right, OperatorNode.jsPlumbNavigator);
    }

    constructor(nodeConfig, container, jsPlumbNavigator) {
        OperatorNode.container = container;
        OperatorNode.jsPlumbNavigator = jsPlumbNavigator;
        this.config = nodeConfig;
        this.element = getNodeElement(nodeConfig);
        this.element.style.position = "relative";
        this.element.addEventListener(
            "pointerdown",
            this.handleDragStartFunc,
            false
        );
    }

    dispose() {
        this.element.removeEventListener(
            "pointerdown",
            this.handleDragStartFunc,
            false
        );
    }
}

(function () {
    class OperatorBar {
        constructor(jsPlumbNavigator, options) {
            this.options = options;
            this.jsPlumbNavigator = jsPlumbNavigator;

            this.barEle = this.#createBarEle();
            jsPlumbNavigator.viewportEle.appendChild(this.barEle);
            this.#setOperatorEle();
        }

        #createBarEle() {
            const { barWidth, barPosition } = this.options;
            const ele = document.createElement("div");
            ele.className = "operator-bar";
            if (barWidth !== null) {
                ele.style.width = `${barWidth}px`;
            }

            const margin = rootStyle.var("--node-overview-margin");
            switch (barPosition) {
                case "left":
                    ele.style.left = margin;
                    ele.style.top = margin;
                    ele.style.bottom = margin;
                    break;
                case "right":
                    ele.style.right = margin;
                    ele.style.top = margin;
                    ele.style.bottom = margin;
                    break;
                default:
                    ele.style.left = margin;
                    ele.style.top = margin;
                    ele.style.bottom = margin;
                    break;
            }
            return ele;
        }

        #setOperatorEle() {
            let preOperatorTypeCode = -1;
            if (operatorBarNamespace.operators.length > 0) {
                preOperatorTypeCode =
                    operatorBarNamespace.operators[0].typeCode;
            }
            for (var operator of operatorBarNamespace.operators) {
                if (preOperatorTypeCode != operator.typeCode) {
                    const hrEle = document.createElement("hr");
                    hrEle.className = "operator-bar-hr";
                    this.barEle.appendChild(hrEle);
                }

                const operatorNode = new OperatorNode(
                    operator,
                    this.barEle,
                    this.jsPlumbNavigator
                );
                this.barEle.appendChild(operatorNode.element);

                preOperatorTypeCode = operator.typeCode;
            }
        }
    }

    window.createOperatorBar = (jsPlumbNavigator, options) => {
        const defaultOptions = {
            barWidth: null,
            barPosition: "left",
            nodeOverviewPosition: "right-bottom", // [top / bottom]-[left / right]
        };

        jsPlumbNavigator.jsPlumbInstance.bind("beforeDrop", function (info) {
            const sourceNode = info.connection.source.origin;
            const targetNode = info.connection.target.origin;
            const sourceEndpoint = info.connection.endpoints[0];
            const targetEndpoint = info.dropEndpoint;

            const srcEndpointIdx = sourceNode.outputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === sourceEndpoint.uuid;
                }
            );
            if (srcEndpointIdx === -1) {
                console.warn("[CheckConnect]", info);
                return false;
            }

            const tarEndpointIdx = targetNode.inputEndpoint.findIndex(
                (endpoint) => {
                    return endpoint.uuid === targetEndpoint.uuid;
                }
            );
            if (tarEndpointIdx === -1) {
                console.warn("[CheckConnect]", info, sourceNode);
                return false;
            }

            for (const rule of operatorBarNamespace.connectionRule) {
                if (
                    rule.check(
                        sourceNode,
                        targetNode,
                        srcEndpointIdx,
                        tarEndpointIdx
                    )
                ) {
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                        title: "Error",
                        text: rule.tip,
                        buttonMode: COVERING_BUTTON_MODE.CloseButton,
                    });
                    console.warn("[Connection]", rule.name);
                    return false;
                }
            }
            return true;
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ClearNode, () => {
            const canvasEle = document.getElementById("canvas");

            for (let ptr = canvasEle.children.length - 1; ptr >= 0; ptr--) {
                const element = canvasEle.children[ptr];
                const elementClassName = String(element.className);
                if (!elementClassName.includes("node")) continue;

                element.origin.dispose();
            }
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.CreateNode, (event) => {
            if (
                !(event.detail?.nodesInfo instanceof Array) ||
                !(event.detail?.connectionsInfo instanceof Array)
            ) {
                console.log("[CreateNode] get an unexpected event as", event);
                return;
            }

            let offsetLeft = event.detail?.offsetLeft,
                offsetTop = event.detail?.offsetTop;
            offsetLeft = offsetLeft === undefined ? 0 : offsetLeft;
            offsetTop = offsetTop === undefined ? 0 : offsetTop;

            const addNodes = Array(0);
            for (const { config, left, top, content } of event.detail
                .nodesInfo) {
                const node = new Node(
                    config,
                    left + offsetLeft,
                    top + offsetTop,
                    jsPlumbNavigator
                );
                if (content !== undefined) {
                    for (const arg of config.args) {
                        node.content[arg.name] = content[arg.name];
                    }
                    node.updateOutline();
                }
                addNodes.push(node);
            }

            for (const {
                srcNodeIdx,
                srcEndpointIdx,
                tarNodeIdx,
                tarEndpointIdx,
            } of event.detail.connectionsInfo) {
                jsPlumbNavigator.jsPlumbInstance.connect({
                    source: addNodes[srcNodeIdx].outputEndpoint[srcEndpointIdx],
                    target: addNodes[tarNodeIdx].inputEndpoint[tarEndpointIdx],
                });
            }
        });

        // init overview
        new Overview(jsPlumbNavigator, { ...defaultOptions, ...options });

        // unselect all
        const viewport = jsPlumbNavigator.viewportEle;
        viewport.addEventListener("pointerdown", (e) => {
            if (e.target !== viewport) {
                return;
            }
            // when no enter ctrlKey, unselect all
            if (!e.ctrlKey) {
                Node.clearSelect();
            }
        });

        return new OperatorBar(jsPlumbNavigator, {
            ...defaultOptions,
            ...options,
        });
    };
})();
