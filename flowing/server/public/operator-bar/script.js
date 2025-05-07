/**
 * MESSAGE_TYPE.ClearNodes
 *
 * MESSAGE_TYPE.CreateNodes
 *      (window left, top)
 *      <event.detail.nodesInfo: Array>
 *          [{apiName?, config?, left?, top?, content,id?}] apiName or config require at least one, apiName preferential, id not need to get if not necessary
 *      <event.detail.connectionsInfo: Array>
 *          [{srcNodeIdx, srcEndpointIdx, tarNodeIdx, tarEndpointIdx}]
 *      [<event.detail.offsetLeft: int> <event.detail.offsetTop: int>]
 *      [<event.detail.undoHelperCall:bool>]
 *      [<event.detail.noSelectNodes: bool>]
 *      [<event.detail.viewportCoordinate:bool>]
 *
 * MESSAGE_TYPE.DeleteNodes
 *      <event.detail.nodes: Array<node>|Set<node>>
 *      [<event.detail.undoHelperCall:bool>]
 *      [<event.detail.quiet:bool>]
 *
 * MESSAGE_TYPE.SelectNodes
 *      <event.detail.nodes: Array<node>|Set<node>>
 *
 * MESSAGE_TYPE.HideOperatorBar
 *
 * MESSAGE_TYPE.ShowOperatorBar
 *
 * MESSAGE_TYPE.VisibleOperatorBar -> bool
 */

const NODE_FRAME_QUEUE_WEIGHT = 1;

let MAX_Z_INDEX = 16; // reserve 0-15
let CREATE_NODE_COUNT = 0;
let ENDPOINT_COUNT = 0;

let PERFORMANCE_ACTION_NODES_COUNT = 200;
let PERFORMANCE_ACTION_SELECT_NODES_COUNT = 20;
let CURRENT_NODES_COUNT = 0;

const DELETE_ICON = ICONS.delete;

function getNextZIndex() {
    return ++MAX_Z_INDEX;
}

function getNextNodeId() {
    return CREATE_NODE_COUNT++;
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
    node.style.backgroundColor = config.backgroundColor;
    return node;
}

class Overview {
    static #overviewInstance = null;

    element;
    viewport;

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
        return (Overview.#overviewInstance = this);
    }

    prevHideOverview = null;
    show(node) {
        // switch to another
        if (this.prevHideOverview) {
            this.prevHideOverview();
        }

        // title
        const title = document.createElement("div");
        title.classList.add("overview-title");
        const link = document.createElement("div");
        if (node.config.link) {
            link.onclick = () => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
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
        link.textContent = node.config.apiName;
        if (node.config.framework !== operatorBarNamespace.framework.all) {
            link.textContent += "(" + node.config.framework + ")";
        }
        title.appendChild(link);
        this.element.appendChild(title);

        // id
        const id = document.createElement("div");
        id.classList.add("overview-id");
        id.textContent = `#${node.id}`;
        this.element.appendChild(id);

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
                        if (
                            operatorBarNamespace.argsValueCheck(
                                arg.type,
                                itemInput.value
                            )
                        ) {
                            node.content[arg.name] = itemInput.value;
                        } else {
                            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                                title: "Warning!",
                                text: arg.type.note,
                                buttonMode: COVERING_BUTTON_MODE.CloseButton,
                            });
                            itemInput.value = arg.default;
                            node.content[arg.name] = arg.default;
                        }
                        node.update();
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
                        node.update();
                    };
                    break;
                default:
                    console.error(
                        "[operator-bar] get a nonsupport input type: ${arg.type.input}."
                    );
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
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

        // button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("overview-delete-button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            this.remove();
            node.dispose();
        });
        this.element.appendChild(deleteButton);

        const hideOverview = () => {
            // point down beyond the overview
            this.remove();
            node.update();
            node.hideOverview = null;
        };
        this.prevHideOverview = node.hideOverview = hideOverview.bind(this);
    }

    remove() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.lastChild);
        }
        this.prevHideOverview = null;
    }
}

class Node {
    id;
    element; // element.origin -> this
    config;
    content; // object, "default" using to record default value.
    outputEndpoint; // array[endpoint]
    inputEndpoint; // array[endpoint]
    inputEndpointPrev; // update at graph, array[Point]
    inputEndpointShape; // update at graph, array[array|null|undefined]
    outputEndpointShape; // update at graph, array[array|null|undefined]
    outputEndpointShapeInfo; // update at graph, array[str|null]
    prevNodes; // update at graph, set<Node>
    connections; // update at graph, map<string,{connection:connection,src:Node,tar:Node,srcEndpointIdx:int,tarEndpointIdx:int}>
    outline;
    canvas;
    viewport;
    static jsPlumbInstance;

    // static method
    static SELECTED_NODES_SET = new Set();
    static clearSelect() {
        for (const node of Node.SELECTED_NODES_SET) {
            node.unSelect(); // unSelect will delete itself from SELECTED_NODES_SET.
        }
    }
    static selectNode(node, control) {
        if (control) {
            if (Node.SELECTED_NODES_SET.has(node)) {
                // unselect when select again
                node.unSelect();
            } else {
                // select
                Node.SELECTED_NODES_SET.add(node);
                node.select(false);
            }
        } else {
            // clear if node not selected and select it
            if (!Node.SELECTED_NODES_SET.has(node)) {
                Node.clearSelect();
            }
            Node.SELECTED_NODES_SET.add(node);
            node.select(true);
        }
    }
    static setSelectNodes(nodes) {
        this.clearSelect();
        for (const node of nodes) {
            this.SELECTED_NODES_SET.add(node);
            node.select(false);
        }
    }

    static createEndpoint(
        element,
        anchorType,
        index,
        total,
        labelText,
        style,
        initNow = true
    ) {
        const placeRate = (index + 1) / (total + 1);
        const endpoint = Node.jsPlumbInstance.addEndpoint(element, {
            uuid: getNextEndpointId(),
            anchors: [placeRate, ...anchorType],
            ...style,
        });

        const pushLabel = () => {
            const label = document.createElement("div");
            label.className = "node-endpoint-label";
            label.textContent = labelText;
            element.appendChild(label);

            const positionStyle =
                anchorType[0] === 1
                    ? {
                          top: `${label.offsetHeight / 2}px`,
                      }
                    : {
                          bottom: `${(label.offsetHeight * 4) / 7}px`,
                      };
            Object.assign(label.style, {
                left: `${
                    element.offsetWidth * placeRate - label.offsetWidth / 2
                }px`,
                ...positionStyle,
            });
        };

        if (initNow) {
            pushLabel();
        } else {
            CALL_BEFORE_NEXT_FRAME(NODE_FRAME_QUEUE_WEIGHT, pushLabel);
        }

        return endpoint;
    }

    update() {
        // outline
        let outlineText = "";
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

        // shape
        MESSAGE_PUSH(MESSAGE_TYPE.UpdateShape, {
            node: this,
        });
    }

    upZIndex() {
        this.element.style.zIndex = getNextZIndex();
    }

    pointerDownHandler(e) {
        this.upZIndex();
        if (e.button === 0) {
            Node.selectNode(this, e.ctrlKey);
        }
    }
    pointerDownHandlerFunc = this.pointerDownHandler.bind(this);

    getCoordinates() {
        return {
            left: Number.parseFloat(this.element.style.left.slice(0, -2)),
            top: Number.parseFloat(this.element.style.top.slice(0, -2)),
        };
    }

    getSize() {
        return {
            width: this.element.offsetWidth,
            height: this.element.offsetHeight,
        };
    }

    coordinatesTruncate(left, top) {
        const { width, height } = this.getSize();
        if (
            left > CANVAS_MAX_LEFT - width ||
            left < CANVAS_MIN_LEFT ||
            top > CANVAS_MAX_TOP - height ||
            top < CANVAS_MIN_TOP
        ) {
            console.warn(`[Node] too extreme coordinates, truncated!`);
        }
        left = Math.min(
            CANVAS_MAX_LEFT - width,
            Math.max(left, CANVAS_MIN_LEFT)
        );
        top = Math.min(CANVAS_MAX_TOP - height, Math.max(top, CANVAS_MIN_TOP));

        return {
            left: left,
            top: top,
        };
    }

    redrawPlanned = false;
    nextLeft;
    nextTop;
    #redraw(focus) {
        this.element.style.left = `${this.nextLeft}px`;
        this.element.style.top = `${this.nextTop}px`;
        Node.jsPlumbInstance.revalidate(this.element);
        this.updateNavigator(focus, this.nextLeft, this.nextTop);
        this.redrawMiniMapNode(focus);
        this.redrawPlanned = false;
    }
    redraw(left, top, force) {
        const { left: L, top: T } = this.coordinatesTruncate(left, top);
        this.nextLeft = L;
        this.nextTop = T;
        if (force) {
            this.#redraw(focus);
        } else if (!this.redrawPlanned) {
            this.redrawPlanned = true;
            CALL_BEFORE_NEXT_FRAME(
                NODE_FRAME_QUEUE_WEIGHT,
                this.#redraw.bind(this)
            );
        }
    }

    updateNavigator(focus, left, top) {
        if (focus) {
            MESSAGE_CALL(MESSAGE_TYPE.NavigatorUpdateNode, {
                node: this,
                left: left,
                top: top,
            });
        } else {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorUpdateNode, {
                node: this,
                left: left,
                top: top,
            });
        }
    }

    redrawMiniMapNode(focus) {
        if (focus) {
            MESSAGE_CALL(MESSAGE_TYPE.RedrawMapNode, {
                id: this.id,
                left: this.element.offsetLeft,
                top: this.element.offsetTop,
                width: this.element.offsetWidth,
                height: this.element.offsetHeight,
            });
        } else {
            MESSAGE_PUSH(MESSAGE_TYPE.RedrawMapNode, {
                id: this.id,
                left: this.element.offsetLeft,
                top: this.element.offsetTop,
                width: this.element.offsetWidth,
                height: this.element.offsetHeight,
            });
        }
    }

    hideOverview = null;
    showOverview() {
        new Overview().show(this);
    }

    setHandle() {
        this.element.addEventListener(
            "pointerdown",
            this.pointerDownHandlerFunc
        );

        // overview
        // show when node is being selected.

        // right-key-menu
        this.element.oncontextmenu = (e) => {
            // if not selected nodes using this node
            const nodes = Node.SELECTED_NODES_SET.has(this)
                ? Node.SELECTED_NODES_SET
                : [this];
            const nodesLength =
                nodes instanceof Set ? nodes.size : nodes.length;
            MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
                showLeft: e.clientX,
                showTop: e.clientY,
                items: [
                    {
                        title: `Copy ${nodesLength} Nodes`,
                        keyTips: "Ctrl+C",
                        icon: ICONS.copy,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NodesCopy, {
                                nodes: nodes,
                            });
                        },
                    },
                    {
                        title: `Delete ${nodesLength} Nodes`,
                        keyTips: "Backspace",
                        icon: ICONS.delete,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.DeleteNodes, {
                                nodes: nodes,
                            });
                        },
                    },
                    {
                        isSeparator: true,
                    },
                    {
                        title: "Export Selected",
                        icon: ICONS.export,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.ExportGraph, {
                                nodes: nodes,
                            });
                        },
                    },
                ],
            });
            return false;
        };
    }

    #init(left, top) {
        this.redraw(left, top, true);

        // set outline
        const outline = document.createElement("span");
        outline.classList.add("node-outline");
        this.element.appendChild(outline);
        this.outline = outline;

        this.update();

        this.setHandle();

        CURRENT_NODES_COUNT++;
    }

    constructor(
        nodeConfig,
        left,
        top,
        jsPlumbNavigator,
        content = undefined,
        initNow = true,
        id = undefined // warning: do not push a id >= getNextNodeId(), and it must be exist prev.
    ) {
        if (id === undefined) {
            id = getNextNodeId();
        }
        this.id = id;
        this.config = nodeConfig;
        Node.jsPlumbInstance = jsPlumbNavigator.jsPlumbInstance;
        this.canvas = jsPlumbNavigator.canvasEle;
        this.viewport = jsPlumbNavigator.viewportEle;
        this.content = {};
        this.content.default = {};
        this.outputEndpoint = Array(nodeConfig.outputEnd.length);
        this.inputEndpoint = Array(nodeConfig.inputEnd.length);
        this.inputEndpointPrev = Array(nodeConfig.inputEnd.length).fill(null);
        this.inputEndpointShape = Array(nodeConfig.inputEnd.length).fill(null);
        this.outputEndpointShape = Array(nodeConfig.outputEnd.length).fill(
            null
        );
        this.outputEndpointShapeInfo = null;
        this.outputEndpointConnection = Array(nodeConfig.outputEnd.length).fill(
            null
        );
        this.prevNodes = new Set();
        this.connections = new Map();

        this.element = getNodeElement(nodeConfig);
        this.element.id = this.id;
        this.element.origin = this;

        // set content
        if (content) {
            for (const arg of this.config.args) {
                // check containing this arg
                if (!content.hasOwnProperty(arg.name)) {
                    throw "node don't have enough args";
                }

                this.content[arg.name] = content[arg.name];

                // check the value is valid
                if (
                    !operatorBarNamespace.argsValueCheck(
                        arg.type,
                        this.content[arg.name]
                    )
                ) {
                    throw "node have unexpected args value";
                }
            }
        } else {
            for (const arg of this.config.args) {
                this.content[arg.name] = arg.default;
            }
        }

        // place
        this.element.style.position = "absolute";
        const canvasBounds = jsPlumbNavigator.getCanvasBounds();
        left -= canvasBounds.left;
        top -= canvasBounds.top;

        this.upZIndex();

        // jsPlumb
        MESSAGE_CALL(MESSAGE_TYPE.NavigatorManageNode, {
            node: this,
            left: left,
            top: top,
        });

        // set outputEndpointConnection
        for (let idx = 0; idx < nodeConfig.outputEnd.length; idx++) {
            this.outputEndpointConnection[idx] = new Set();
        }

        // set endpoint
        for (let ptr = 0; ptr < nodeConfig.outputEnd.length; ptr++) {
            this.outputEndpoint[ptr] = Node.createEndpoint(
                this.element,
                [1, 0, 1],
                ptr,
                nodeConfig.outputEnd.length,
                nodeConfig.outputEnd[ptr],
                operatorBarNamespace.outputEndpointDefaultStyle,
                initNow
            );
        }
        for (let ptr = 0; ptr < nodeConfig.inputEnd.length; ptr++) {
            this.inputEndpoint[ptr] = Node.createEndpoint(
                this.element,
                [0, 0, -1],
                ptr,
                nodeConfig.inputEnd.length,
                nodeConfig.inputEnd[ptr],
                operatorBarNamespace.inputEndpointDefaultStyle,
                initNow
            );
        }

        if (initNow) {
            this.#init(left, top);
        } else {
            CALL_BEFORE_NEXT_FRAME(
                NODE_FRAME_QUEUE_WEIGHT,
                this.#init.bind(this, left, top)
            );
        }

        // add to Id2Node
        MEMORY_GET(MEMORY_KEYS.Id2Node).set(id, this);
    }

    select(showOverview) {
        this.element.style.outlineColor = rootStyle.var(
            "--node-selected-outline-color"
        );
        this.element.style.outlineWidth = rootStyle.var(
            "--node-selected-outline-width"
        );
        if (showOverview && this.hideOverview === null) {
            this.showOverview();
        }
        Node.jsPlumbInstance.addToDragSelection(this.element);
        Node.SELECTED_NODES_SET.add(this);
    }

    unSelect() {
        this.element.style.outlineColor = rootStyle.var("--node-outline-color");
        this.element.style.outlineWidth = rootStyle.var("--border-width");
        if (this.hideOverview) {
            this.hideOverview();
        }
        Node.jsPlumbInstance.removeFromDragSelection(this.element);
        Node.SELECTED_NODES_SET.delete(this);
    }

    dispose() {
        if (this.element) {
            this.unSelect();
            this.element.removeEventListener(
                "pointerdown",
                this.pointerDownHandlerFunc
            );
            this.element.oncontextmenu = null;
            this.element.remove();
            // delete from Id2Node
            MEMORY_GET(MEMORY_KEYS.Id2Node).delete(this.id);
            CURRENT_NODES_COUNT--;
        }
        // delete from MiniMap
        MESSAGE_PUSH(MESSAGE_TYPE.DeleteMapNode, {
            id: this.id,
        });
        MESSAGE_PUSH(MESSAGE_TYPE.NavigatorRemoveNode, {
            node: this,
        });
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

        MESSAGE_PUSH(MESSAGE_TYPE.NavigatorMoveWhenAtEdge);

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
            const coordinates = coordinatesWindow2Viewport(
                e.clientX,
                e.clientY
            );
            const scale = OperatorNode.jsPlumbNavigator.getCanvasScale();
            OperatorNode.pointFollowNode.origin.addNode(
                coordinates.left / scale - OperatorNode.pointFollowNode.offsetX,
                coordinates.top / scale - OperatorNode.pointFollowNode.offsetY
            );
        }

        MESSAGE_PUSH(MESSAGE_TYPE.NavigatorCancelMoveWhenAtEdge);

        OperatorNode.deletePointFollowNode();
    }

    addNode(left, top) {
        const result = MESSAGE_CALL(MESSAGE_TYPE.CreateNodes, {
            nodesInfo: [
                {
                    config: this.config,
                    left: left,
                    top: top,
                },
            ],
            connectionsInfo: [],
            noSelectNodes: true,
        });

        if (result.includes(false)) {
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.ERROR,
                content: "Add node failed, please contact us!",
                timeout: 5000,
            });
        }
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

class OperatorBar {
    options;
    jsPlumbNavigator;
    containerEle;
    barEle;
    searchEle;

    // using to chose operators need to show.
    onlyChoseNameLike = "";
    excludeTypes = new Set();

    static searchIconSvg = ICONS.search;
    static clearIconSvg = ICONS.cross;

    static visibleSvg = ICONS.downTriangle;
    static hiddenSvg = ICONS.leftTriangle;

    constructor(jsPlumbNavigator, options) {
        this.options = options;
        this.jsPlumbNavigator = jsPlumbNavigator;

        [this.containerEle, this.barEle] = this.#initBarEle();

        this.searchEle = this.#initSearchEle();
        if (this.options.needSearch) {
            this.barEle.appendChild(this.searchEle);
        }

        if (this.options.showAtFirst) {
            this.show();
        } else {
            this.hide();
        }

        this.#initHandler();

        jsPlumbNavigator.viewportEle.appendChild(this.containerEle);
        this.refresh();
    }

    #initBarEle() {
        const { barWidth, barPosition } = this.options;

        const containerEle = document.createElement("div");
        containerEle.className = "operator-bar-container";

        const barEle = document.createElement("div");
        barEle.className = "operator-bar";
        if (barWidth !== null) {
            barEle.style.width = `${barWidth}px`;
        }

        switch (barPosition) {
            case "left":
                containerEle.style.left = "0px";
                break;
            case "right":
                containerEle.style.right = "0px";
                break;
            default:
                containerEle.style.left = "0px";
                break;
        }

        containerEle.append(barEle);

        return [containerEle, barEle];
    }

    #initSearchEle() {
        if (!this.options.needSearch) {
            return null;
        }

        const ele = document.createElement("div");
        ele.classList.add(operatorBarNamespace.baseNodeCssClass);
        ele.classList.add("operator-bar-search-bar");

        const searchIcon = document.createElement("div");
        searchIcon.className = "operator-bar-search-icon";
        searchIcon.innerHTML = OperatorBar.searchIconSvg;
        ele.appendChild(searchIcon);

        const searchInput = document.createElement("input");
        searchInput.className = "operator-bar-search-input";
        searchInput.placeholder = "Search Operator";
        searchInput.onchange = () => {
            this.onlyChoseNameLike = searchInput.value;
            this.excludeTypes.clear();
            this.refresh();
        };
        ele.appendChild(searchInput);

        const closeIcon = document.createElement("div");
        closeIcon.className = "operator-bar-search-icon";
        closeIcon.innerHTML = OperatorBar.clearIconSvg;
        closeIcon.onclick = () => {
            searchInput.value = this.onlyChoseNameLike = "";
            this.excludeTypes.clear();
            this.refresh();
        };

        ele.appendChild(closeIcon);

        return ele;
    }

    #initHandler() {
        MESSAGE_HANDLER(MESSAGE_TYPE.ShowOperatorBar, this.show.bind(this));
        MESSAGE_HANDLER(MESSAGE_TYPE.HideOperatorBar, this.hide.bind(this));
        MESSAGE_HANDLER(MESSAGE_TYPE.VisibleOperatorBar, () => this.visible);
    }

    #createSeparation(typeInfo, isVisible) {
        // typeInfo {name, code}
        const sepEle = document.createElement("div");
        sepEle.className = "operator-bar-sep";

        const sepTitleEle = document.createElement("div");
        sepTitleEle.className = "operator-bar-sep-title";
        sepTitleEle.textContent = typeInfo.name;
        sepEle.appendChild(sepTitleEle);

        const sepSwitchEle = document.createElement("div");
        sepSwitchEle.className = "operator-bar-sep-switch";
        sepSwitchEle.innerHTML = isVisible
            ? OperatorBar.visibleSvg
            : OperatorBar.hiddenSvg;
        sepEle.appendChild(sepSwitchEle);

        sepEle.isChosen = isVisible;
        sepEle.onclick = () => {
            if (sepEle.isChosen) {
                sepSwitchEle.innerHTML = OperatorBar.hiddenSvg;
                this.excludeTypes.add(typeInfo.code);
            } else {
                sepSwitchEle.innerHTML = OperatorBar.visibleSvg;
                this.excludeTypes.delete(typeInfo.code);
            }
            sepEle.isChosen = !sepEle.isChosen;
            this.refresh();
        };

        sepEle.updateCount = (cnt) => {
            sepTitleEle.textContent = `${typeInfo.name}(${cnt})`;
        };

        return sepEle;
    }

    refresh() {
        // clear prev operators
        for (let ptr = this.barEle.children.length - 1; ptr >= 0; ptr--) {
            const element = this.barEle.children[ptr];
            if (element === this.searchEle) {
                break;
            }
            element.remove();
        }

        const onlyLike = this.onlyChoseNameLike.toLowerCase();

        let prevOperatorTypeCode = -1;
        let prevOperatorTypeSepEle = null;
        let prevOperatorTypeCount = 0;
        // operatorBarNamespace.operators is sort by prevOperatorTypeCode.
        for (let operator of operatorBarNamespace.operators) {
            const operatorTypeInfo =
                operatorBarNamespace.typeInfo[operator.typeCode];

            // check if "operatorTypeName" or "apiName" contain "onlyLike"
            if (
                !operator.apiName.toLowerCase().includes(onlyLike) &&
                !operatorTypeInfo.name.toLowerCase().includes(onlyLike)
            ) {
                continue;
            }

            // when this type is excluded, don't add this operator, but add the sep if need.
            const isExcludeType = this.excludeTypes.has(operator.typeCode);
            if (prevOperatorTypeCode !== operator.typeCode) {
                const sepEle = this.#createSeparation(
                    operatorTypeInfo,
                    !isExcludeType
                );
                this.barEle.appendChild(sepEle);

                // update prev count
                if (prevOperatorTypeSepEle) {
                    prevOperatorTypeSepEle.updateCount(prevOperatorTypeCount);
                }

                prevOperatorTypeCode = operator.typeCode;
                prevOperatorTypeCount = 0;
                prevOperatorTypeSepEle = sepEle;
            }

            // count even excluded
            prevOperatorTypeCount += 1;

            if (isExcludeType) {
                continue;
            }

            const operatorNode = new OperatorNode(
                operator,
                this.barEle,
                this.jsPlumbNavigator
            );
            this.barEle.appendChild(operatorNode.element);
        }
        // update prev count
        if (prevOperatorTypeSepEle) {
            prevOperatorTypeSepEle.updateCount(prevOperatorTypeCount);
        }
    }

    visible;
    hide() {
        this.barEle.classList.add("operator-bar-hide-mode");
        this.visible = false;
    }
    show() {
        this.barEle.classList.remove("operator-bar-hide-mode");
        this.visible = true;
    }
}

(function () {
    // add info to share
    MEMORY_SET(MEMORY_KEYS.NodeInformation, {
        argsInputType: operatorBarNamespace.argsInputType,
        argsType: operatorBarNamespace.argsType,
        argsValueCheck: operatorBarNamespace.argsValueCheck,
        connectionRule: operatorBarNamespace.connectionRule,
        operators: operatorBarNamespace.operators,
    });

    window.createOperatorBar = (jsPlumbNavigator, options) => {
        const defaultOptions = {
            barWidth: null,
            barPosition: "left",
            nodeOverviewPosition: "right-bottom", // [top / bottom]-[left / right]
            needSearch: true,
            showAtFirst: true,
        };

        // init Id2Node
        MEMORY_SET(MEMORY_KEYS.Id2Node, new Map());

        /**
         * using to:
         *      1. check if after connection it will violate constraints
         */
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
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
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

        MESSAGE_HANDLER(MESSAGE_TYPE.ClearNodes, () => {
            const canvasEle = document.getElementById("canvas");

            const nodes = [];

            for (let ptr = canvasEle.children.length - 1; ptr >= 0; ptr--) {
                const element = canvasEle.children[ptr];
                const elementClassName = String(element?.className);
                if (!elementClassName.includes("node")) continue;

                nodes.push(element.origin);
            }

            MESSAGE_CALL(MESSAGE_TYPE.DeleteNodes, { nodes });
            MESSAGE_CALL(MESSAGE_TYPE.NavigatorViewAllFit);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.CreateNodes, (event) => {
            if (
                !(event.detail?.nodesInfo instanceof Array) ||
                !(event.detail?.connectionsInfo instanceof Array)
            ) {
                console.error(
                    "[CreateNodes] get an unexpected event as",
                    event
                );
                return false;
            }

            let offsetLeft = event.detail?.offsetLeft,
                offsetTop = event.detail?.offsetTop;
            offsetLeft = offsetLeft === undefined ? 0 : offsetLeft;
            offsetTop = offsetTop === undefined ? 0 : offsetTop;

            const isViewportCoordinate = event.detail?.viewportCoordinate;
            const canvasBounds = jsPlumbNavigator.getCanvasBounds();

            const addNodes = [];
            for (let { id, apiName, config, left, top, content } of event.detail
                .nodesInfo) {
                if (apiName !== undefined) {
                    config =
                        operatorBarNamespace.apiName2operators.get(apiName);
                }
                if (config === undefined) {
                    console.error(
                        `[CreateNodes] get unexpected node, can't find config from ${apiName}`,
                        event
                    );
                    return false;
                }

                left = left === undefined ? 0 : left;
                top = top === undefined ? 0 : top;

                left += offsetLeft;
                top += offsetTop;

                if (isViewportCoordinate) {
                    left += canvasBounds.left;
                    top += canvasBounds.top;
                }

                try {
                    const node = new Node(
                        config,
                        left,
                        top,
                        jsPlumbNavigator,
                        content,
                        false,
                        id
                    );
                    addNodes.push(node);
                } catch (err) {
                    console.error("[CreateNodes] create node error", {
                        err,
                        event,
                        apiName,
                    });
                    return false;
                }
            }

            if (!event.detail?.noSelectNodes) {
                MESSAGE_PUSH(MESSAGE_TYPE.SelectNodes, { nodes: addNodes });
            }

            const createConnections = [];
            for (const {
                srcNodeIdx,
                srcEndpointIdx,
                tarNodeIdx,
                tarEndpointIdx,
            } of event.detail.connectionsInfo) {
                try {
                    if (
                        addNodes[srcNodeIdx].outputEndpoint[srcEndpointIdx] ==
                            undefined ||
                        addNodes[tarNodeIdx].inputEndpoint[tarEndpointIdx] ==
                            undefined
                    ) {
                        throw "endpoint not found";
                    }

                    MEMORY_GET(MEMORY_KEYS.ConnectionCreateIgnore).add(
                        getConnectionKey(
                            addNodes[srcNodeIdx].id,
                            srcEndpointIdx,
                            addNodes[tarNodeIdx].id,
                            tarEndpointIdx
                        )
                    );

                    jsPlumbNavigator.jsPlumbInstance.connect({
                        source: addNodes[srcNodeIdx].outputEndpoint[
                            srcEndpointIdx
                        ],
                        target: addNodes[tarNodeIdx].inputEndpoint[
                            tarEndpointIdx
                        ],
                    });

                    createConnections.push({
                        src: addNodes[srcNodeIdx],
                        tar: addNodes[tarNodeIdx],
                        srcEndpointIdx,
                        tarEndpointIdx,
                    });
                } catch (err) {
                    console.error("[CreateNodes] can't connect some of nodes", {
                        err,
                        event,
                        src: addNodes[srcNodeIdx],
                        tar: addNodes[tarNodeIdx],
                        srcEndpointIdx,
                        tarEndpointIdx,
                    });
                    return false;
                }
            }

            if (!event.detail?.undoHelperCall) {
                MESSAGE_CALL(MESSAGE_TYPE.OperationSave, {
                    createNodes: addNodes,
                    createConnections,
                });
            }

            return true;
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.DeleteNodes, (event) => {
            if (
                event.detail?.nodes === undefined ||
                event.detail.nodes[Symbol.iterator] === undefined
            ) {
                console.error(
                    "[DeleteNodes] get an unexpected event as",
                    event
                );
                return;
            }

            const len =
                event.detail.nodes.length !== undefined
                    ? event.detail.nodes.length
                    : event.detail.nodes.size;

            if (len === 0) {
                console.warn("[DeleteNodes] not nodes need to delete.", event);
                return;
            }

            // unique
            const deleteConnectionsMap = new Map();
            for (const node of event.detail.nodes) {
                for (const [key, info] of node.connections) {
                    deleteConnectionsMap.set(key, info);
                }
            }

            if (!event.detail?.undoHelperCall) {
                const deleteConnections = [];
                for (const [_, info] of deleteConnectionsMap) {
                    deleteConnections.push({
                        src: info.src,
                        srcEndpointIdx: info.srcEndpointIdx,
                        tar: info.tar,
                        tarEndpointIdx: info.tarEndpointIdx,
                    });

                    MEMORY_GET(MEMORY_KEYS.ConnectionDeleteIgnore).add(
                        getConnectionKey(
                            info.src.id,
                            info.srcEndpointIdx,
                            info.tar.id,
                            info.tarEndpointIdx
                        )
                    );
                }
                MESSAGE_CALL(MESSAGE_TYPE.OperationSave, {
                    deleteNodes: event.detail.nodes,
                    deleteConnections,
                });
            }

            if (!event.detail?.quiet) {
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.INFO,
                    iconSvg: DELETE_ICON,
                    content: `Delete ${len} node(s) and ${deleteConnectionsMap.size} connection(s)`,
                    timeout: 1000,
                });
            }

            // delete
            for (const node of event.detail.nodes) {
                node.dispose();
            }

            console.info(
                `[DeleteNodes] delete ${len} node(s) and ${deleteConnectionsMap.size} connection(s).`
            );
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.SelectNodes, (event) => {
            // select all when event.detail.nodes === undefined
            let nodes = event.detail?.nodes;
            if (nodes === undefined) {
                nodes = [];

                const canvasEle = document.getElementById("canvas");
                for (const element of canvasEle.children) {
                    const elementClassName = String(element?.className);
                    if (!elementClassName.includes("node")) continue;

                    nodes.push(element.origin);
                }
            }

            // event.detail?.nodes !== undefined
            if (nodes[Symbol.iterator] === undefined) {
                console.error(
                    "[SelectNodes] get an unexpected event as",
                    event
                );
                return;
            }

            Node.setSelectNodes(nodes);
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

        /**
         * using to:
         *      1. redraw
         */
        jsPlumbNavigator.jsPlumbInstance.bind(
            "drag:stop",
            (dragStopPayload) => {
                for (const ele of dragStopPayload.elements) {
                    const node = ele.el.origin;
                    const { left, top } = node.getCoordinates();
                    node.redraw(left, top, true);
                }
            }
        );

        /**
         * using to:
         *      1. update MiniMap
         */
        jsPlumbNavigator.jsPlumbInstance.bind(
            "drag:move",
            (dragMovePayload) => {
                // when the nodes or select nodes count are small, just redraw when drag
                if (
                    CURRENT_NODES_COUNT >= PERFORMANCE_ACTION_NODES_COUNT ||
                    Node.SELECTED_NODES_SET.size >=
                        PERFORMANCE_ACTION_SELECT_NODES_COUNT *
                            (1 -
                                CURRENT_NODES_COUNT /
                                    PERFORMANCE_ACTION_NODES_COUNT)
                ) {
                    return;
                }

                dragMovePayload.el.origin.redrawMiniMapNode();
            }
        );

        /**
         * right-key-menu for connections
         */
        jsPlumbNavigator.jsPlumbInstance.bind(
            "connection:contextmenu",
            (connection) => {
                const displayCoordinate = MEMORY_GET(
                    MEMORY_KEYS.PrevMouseRightButtonCoordinate
                );
                MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
                    showLeft: displayCoordinate.left,
                    showTop: displayCoordinate.top,
                    items: [
                        {
                            title: "Disconnect",
                            keyTips: "Drag",
                            icon: ICONS.disconnect,
                            callback: () => {
                                jsPlumbNavigator.jsPlumbInstance.deleteConnection(
                                    connection
                                );
                            },
                        },
                    ],
                });
                return false;
            }
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "a",
            [MODIFIER_KEY_CODE.ctrl],
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.SelectNodes);
            }
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "c",
            [MODIFIER_KEY_CODE.ctrl],
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NodesCopy, {
                    nodes: Node.SELECTED_NODES_SET,
                });
            }
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "v",
            [MODIFIER_KEY_CODE.ctrl],
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NodesPaste);
            }
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "z",
            [MODIFIER_KEY_CODE.ctrl],
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.OperationUndo);
            }
        );

        ADD_KEY_HANDLER(DEFAULT_KEY_NAMESPACE, "Backspace", [], () => {
            MESSAGE_PUSH(MESSAGE_TYPE.DeleteNodes, {
                nodes: Node.SELECTED_NODES_SET,
            });
        });

        return new OperatorBar(jsPlumbNavigator, {
            ...defaultOptions,
            ...options,
        });
    };
})();
