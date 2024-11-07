/**
 * node: DOM-div
 *      .id:                (str) node's id
 *      .config:            (map) operatorBarNamespace.operators[x]
 *      .content:           (map) operatorBarNamespace.operators[x].args -> val
 *      .outputEndpoint:    (array) output endpoint for each place
 *      .inputEndpoint:     (array) input endpoint for each place
 *      .inputEndpointPrev: (array) input endpoint connect node and endpoint, using in other module
 *      .outline:           (DOM-div) to show some important args
 *      .outlineUpdate:     (func) to update outline
 *      .jsPlumbInstance
 */

(function () {
    const rootStyle = getComputedStyle(document.querySelector(":root"));
    rootStyle.var = (key) => rootStyle.getPropertyValue(key);

    let operatorNodeSelected = null;
    let offsetX, offsetY;

    function operatorNodeDragStart(e) {
        if (e.buttons !== 1) return false;
        if (e.target === this) {
            e.preventDefault();

            operatorNodeSelected = this.cloneNode(true);
            operatorNodeSelected.origin = this;

            offsetX = e.clientX - this.getBoundingClientRect().left;
            offsetY = e.clientY - this.getBoundingClientRect().top;

            operatorNodeSelected.style.zIndex = getMaxZIndex();
            operatorNodeSelected.style.position = "absolute";
            document.body.appendChild(operatorNodeSelected);

            document.addEventListener("pointermove", operatorNodeDrag, false);
            document.addEventListener("pointerup", operatorNodeDragEnd, false);
        }
        return false;
    }

    function operatorNodeDrag(e) {
        if (operatorNodeSelected !== null) {
            e.preventDefault();
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            operatorNodeSelected.style.left = `${x}px`;
            operatorNodeSelected.style.top = `${y}px`;
        }
    }

    function operatorNodeDragEnd(e) {
        if (operatorNodeSelected !== null) {
            const boundingClientRect =
                operatorNodeSelected.origin.barEle.getBoundingClientRect();
            const barMinX = boundingClientRect.left;
            const barMaxX = boundingClientRect.right;
            const barMinY = boundingClientRect.top;
            const barMaxY = boundingClientRect.bottom;
            if (
                e.clientX > barMaxX ||
                e.clientX < barMinX ||
                e.clientY > barMaxY ||
                e.clientY < barMinY
            ) {
                operatorNodeSelected.origin.addNode(
                    e.clientX - offsetX,
                    e.clientY - offsetY
                );
            }
            operatorNodeSelected.style.zIndex = null;
            document.body.removeChild(operatorNodeSelected);
        }
        operatorNodeSelected = null;
        document.removeEventListener("pointermove", operatorNodeDrag, false);
    }

    function getMaxZIndex() {
        if (!window.hasOwnProperty("maxZIndex")) {
            window.maxZIndex = 0;
        }
        return ++window.maxZIndex;
    }

    function getNodeId() {
        if (!window.hasOwnProperty("operatorNodeCount")) {
            window.operatorNodeCount = 0;
        }
        return window.operatorNodeCount++;
    }

    function getEndpointId() {
        if (!window.hasOwnProperty("operatorEndpointCount")) {
            window.operatorEndpointCount = 0;
        }
        return window.operatorEndpointCount++;
    }

    function nodeOverview(e) {
        const node = e.target;
        const nodeStyle = window.getComputedStyle(node);
        const canvas = node.parentElement;
        const viewport = canvas.parentElement;

        const overview = document.createElement("div");
        overview.classList.add("overview");
        overview.style.left = nodeStyle.left;
        overview.style.top = nodeStyle.top;
        overview.style.zIndex = Number.MAX_SAFE_INTEGER;
        const rgb = nodeStyle.backgroundColor.match(/\d+/g).map(Number);
        overview.style.backgroundColor =
            "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + "0.8)";

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
        overview.appendChild(title);

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
            itemInput.type = arg.type.input.element.type;
            switch (arg.type.input) {
                case operatorBarNamespace.argsInputType.text:
                    itemInput.onchange = () => {
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
        overview.appendChild(argsContainer);

        // button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("overview-delete-button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            node.jsPlumbInstance.removeAllEndpoints(node);
            node.remove();
            overview.remove();
            document.removeEventListener("pointerdown", removeOverview, false);
        });
        overview.appendChild(deleteButton);

        const removeOverview = (e) => {
            // point down beyond the overview
            if (e.target != overview && !overview.contains(e.target)) {
                canvas.removeChild(overview);
                viewport.removeEventListener(
                    "pointerdown",
                    removeOverview,
                    false
                );
            }
            node.updateOutline();
        };
        viewport.addEventListener("pointerdown", removeOverview, false);

        canvas.appendChild(overview);
    }

    function createOperatorNode(
        nodeConfig,
        baseNodeCssClass,
        barEle,
        jsPlumbNavigator
    ) {
        const getNode = () => {
            const ele = document.createElement("div");
            ele.classList.add(baseNodeCssClass);
            for (const x of nodeConfig.extendCssClass) {
                ele.classList.add(x);
            }
            ele.textContent = nodeConfig.apiName;
            return ele;
        };

        const ele = getNode();
        ele.style.position = "relative";

        ele.prevLeft = ele.style.left;
        ele.prevTop = ele.style.top;
        ele.barEle = barEle;
        ele.addNode = (left, top) => {
            const node = getNode();

            node.id = getNodeId();
            node.config = nodeConfig;
            node.jsPlumbInstance = jsPlumbNavigator.jsPlumbInstance;
            node.content = {};
            node.content.default = {};
            node.outputEndpoint = Array(nodeConfig.outputEnd.length);
            node.inputEndpoint = Array(nodeConfig.inputEnd.length);
            node.inputEndpointPrev = Array(nodeConfig.inputEnd.length);

            const canvasBounds = jsPlumbNavigator.getCanvasBounds();
            const canvasScale = jsPlumbNavigator.getCanvasScale();
            // place
            node.style.position = "absolute";
            node.style.left = `${left / canvasScale - canvasBounds.left}px`;
            node.style.top = `${top / canvasScale - canvasBounds.top}px`;
            // make sure being top
            const upZIndex = (e) => {
                node.style.zIndex = getMaxZIndex();
            };
            node.addEventListener("pointerdown", upZIndex);
            if (!window.hasOwnProperty("maxZIndex")) {
                window.maxZIndex = 0;
            }
            node.style.zIndex = node.style.zIndex = getMaxZIndex();

            jsPlumbNavigator.canvasEle.appendChild(node);
            jsPlumbNavigator.jsPlumbInstance.manage(node);

            // set inputEndpointPrev
            for (var ptr = 0; ptr < nodeConfig.inputEnd.length; ptr++) {
                node.inputEndpointPrev[ptr] = null;
            }

            // set endpoint
            for (var ptr = 0; ptr < nodeConfig.outputEnd.length; ptr++) {
                const endpointId = getEndpointId();
                const placeRate = (ptr + 1) / (nodeConfig.outputEnd.length + 1);

                // endpoint
                node.outputEndpoint[ptr] =
                    jsPlumbNavigator.jsPlumbInstance.addEndpoint(node, {
                        uuid: endpointId,
                        anchors: [placeRate, 1, 0, 1],
                        ...operatorBarNamespace.outputEndpointDefaultStyle,
                    });

                // endpoint label
                const endpointLabel = document.createElement("div");
                endpointLabel.classList.add("node-endpoint-label");
                endpointLabel.textContent = nodeConfig.outputEnd[ptr];
                node.appendChild(endpointLabel);
                endpointLabel.style.top = `${endpointLabel.offsetHeight / 2}px`;
                endpointLabel.style.left = `${
                    node.offsetWidth * placeRate - endpointLabel.offsetWidth / 2
                }px`;
            }
            for (var ptr = 0; ptr < nodeConfig.inputEnd.length; ptr++) {
                const endpointId = getEndpointId();
                const placeRate = (ptr + 1) / (nodeConfig.inputEnd.length + 1);

                node.inputEndpoint[ptr] =
                    jsPlumbNavigator.jsPlumbInstance.addEndpoint(node, {
                        uuid: endpointId,
                        anchors: [placeRate, 0, 0, -1],
                        ...operatorBarNamespace.inputEndpointDefaultStyle,
                    });

                // endpoint label
                const endpointLabel = document.createElement("div");
                endpointLabel.classList.add("node-endpoint-label");
                endpointLabel.textContent = nodeConfig.inputEnd[ptr];
                node.appendChild(endpointLabel);
                endpointLabel.style.bottom = `${
                    (endpointLabel.offsetHeight * 4) / 7
                }px`;
                endpointLabel.style.left = `${
                    node.offsetWidth * placeRate - endpointLabel.offsetWidth / 2
                }px`;
            }

            // args
            for (const arg of node.config.args) {
                node.content[arg.name] = arg.default;
            }

            // outline
            const outline = document.createElement("span");
            outline.classList.add("node-outline");
            node.appendChild(outline);
            node.outline = outline;

            node.updateOutline = () => {
                var outlineText = "";
                for (const { name, short } of node.config.outlines) {
                    if (outlineText !== "") {
                        outlineText += " ";
                    }
                    outlineText += `${short}:${String(node.content[name])}`;
                }
                node.outline.textContent = outlineText;
                if (node.config.changeCallBack instanceof Function) {
                    node.config.changeCallBack(node);
                }
            };
            node.updateOutline();

            // overview
            node.addEventListener("dblclick", nodeOverview);

            // right-key-menu
            node.oncontextmenu = (e) => {
                MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
                    showLeft: e.clientX,
                    showTop: e.clientY,
                    items: [
                        {
                            title: "Copy",
                        },
                        {
                            title: "Edit",
                            callback: () => {
                                nodeOverview({ target: node });
                            },
                        },
                        {
                            title: "Delete",
                            callback: () => {
                                node.jsPlumbInstance.removeAllEndpoints(node);
                                node.remove();
                            },
                        },
                    ],
                });
                return false;
            };
        };

        ele.addEventListener("pointerdown", operatorNodeDragStart, false);
        barEle.appendChild(ele);
    }

    class OperatorBar {
        constructor(jsPlumbNavigator, options) {
            this.options = options;
            this.jsPlumbNavigator = jsPlumbNavigator;

            this.barEle = this.createBarEle();
            jsPlumbNavigator.viewportEle.appendChild(this.barEle);
            this.#setOperatorEle();
        }

        createBarEle() {
            const { barWidth, barPosition } = this.options;
            const ele = document.createElement("div");
            ele.className = "operator-bar";
            ele.style.width = `${barWidth}px`;

            const margin = "4px";
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
                createOperatorNode(
                    operator,
                    operatorBarNamespace.baseNodeCssClass,
                    this.barEle,
                    this.jsPlumbNavigator
                );
                preOperatorTypeCode = operator.typeCode;
            }
        }
    }

    window.createOperatorBar = (jsPlumbNavigator, options) => {
        const defaultOptions = {
            barWidth: null,
            barPosition: "left",
        };

        jsPlumbNavigator.jsPlumbInstance.bind("beforeDrop", function (info) {
            const sourceNode = info.connection.source;
            const targetNode = info.connection.target;
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
                const node = canvasEle.children[ptr];
                const nodeClassName = String(node.className);
                if (!nodeClassName.includes("node")) continue;

                node.jsPlumbInstance.removeAllEndpoints(node);
                node.remove();
            }
        });

        return new OperatorBar(jsPlumbNavigator, {
            ...defaultOptions,
            ...options,
        });
    };
})();
