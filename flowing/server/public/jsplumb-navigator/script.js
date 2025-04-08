/**
 * MESSAGE_TYPE.NavigatorZoomIn
 *
 * MESSAGE_TYPE.NavigatorZoomOut
 *
 * MESSAGE_TYPE.NavigatorZoomTo100
 *
 * MESSAGE_TYPE.NavigatorViewAllFit
 *
 * MESSAGE_TYPE.NavigatorManageNode
 *      <event.detail.node>
 *      <event.detail.left>
 *      <event.detail.top>
 *
 * MESSAGE_TYPE.NavigatorUpdateNode
 *      <event.detail.node>
 *      <event.detail.left>
 *      <event.detail.top>
 *
 * MESSAGE_TYPE.NavigatorRemoveNode
 *      <event.detail.node>
 *
 * MESSAGE_TYPE.NavigationChanged
 *      output => event.detail {
 *          left, top, scale
 *      }
 *
 * MESSAGE_TYPE.NavigatorMoveModeChanged
 *      output => event.detail {
 *          moveMode
 *      }
 *
 * MESSAGE_TYPE.NavigatorMoveWhenAtEdge
 *
 * MESSAGE_TYPE.NavigatorCancelMoveWhenAtEdge
 *
 */

const NAVIGATOR_MOVE_FRAME_QUEUE_WEIGHT = 0;
const NAVIGATOR_FRAME_QUEUE_WEIGHT = 4;

const NAVIGATOR_MIN_SCALE = 0.1;
const NAVIGATOR_MAX_SCALE = 3.0;
const NAVIGATOR_INTERVAL_SCALE = 0.1;
const NAVIGATOR_DEFAULT_SCALE = 1.0;
const NAVIGATOR_CHANGE_INTERVAL_DISTANCE = 50;
const NAVIGATOR_MOVE_BASE_INTERVAL_DISTANCE = 0;
const NAVIGATOR_MOVE_ADD_INTERVAL_DISTANCE = 1;
const NAVIGATOR_MOVE_MAX_INTERVAL_DISTANCE = 16;
const NAVIGATOR_EDGE_WIDTH = 16;

const NAVIGATOR_ICON = ICONS.map;

class Navigator {
    jsPlumbInstance;
    canvasEle;
    viewportEle;
    selectBoxEle;
    canvasTransform;

    moveMode;
    selectBoxUpdateHandler;
    nodeTree = new QuadTree(
        {
            left: CANVAS_MIN_LEFT,
            top: CANVAS_MIN_TOP,
            width: CANVAS_MAX_LEFT - CANVAS_MIN_LEFT,
            height: CANVAS_MAX_TOP - CANVAS_MIN_TOP,
        },
        true
    );

    moveWhenAtEdge = 0; // >=1 means true
    moveSpeedAtEdge = NAVIGATOR_MOVE_BASE_INTERVAL_DISTANCE;
    edgeStatus = 0; // bit [bottom, top, right, left]
    edgeHighlight;

    constructor(jsPlumbInstance, viewportEle, options) {
        this.jsPlumbInstance = jsPlumbInstance;
        this.options = options;
        this.canvasEle = this.jsPlumbInstance.defaults.container;
        this.canvasTransform = this.canvasEle.style.transform;
        this.viewportEle = viewportEle;
        this.viewportEle.onwheel =
            this.handleMiddleMouseScrollAndZoom.bind(this);
        this.viewportEle.onpointerdown =
            this.handleViewportPointerDown.bind(this);
        this.viewportEle.onpointerup = this.handleViewportPointerUp.bind(this);
        this.viewportEle.oncontextmenu =
            this.handleViewportRightKeyMenu.bind(this);

        this.selectBoxEle = this.#createSelectBoxEle();
        this.canvasEle.appendChild(this.selectBoxEle);

        this.edgeHighlight = new EdgeHighlighter(viewportEle);

        this.#addHandler();

        this.changeMoveMode(true, false);

        this.startAnimationFrame();
        this.backToOrigin();
        this.viewAllFit();
    }

    changeMoveMode(moveMode, PromptShow = true) {
        if (moveMode) {
            this.hideSelectBox();
        }
        this.moveMode = moveMode;
        MESSAGE_PUSH(MESSAGE_TYPE.NavigatorMoveModeChanged, {
            moveMode: moveMode,
        });
        if (PromptShow) {
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: NAVIGATOR_ICON,
                content: `Change to "${
                    moveMode ? "Move" : "Select"
                }" viewport drag mode.`,
                timeout: 2000,
            });
        }
    }

    #addHandler() {
        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorManageNode, (event) => {
            const { node, left, top } = event.detail ?? {};
            if (node == undefined || left == undefined || top == undefined) {
                console.error("[NavigatorManageNode] params not provided!");
                return;
            }

            this.addNode(node, left, top);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorUpdateNode, (event) => {
            const { node, left, top } = event.detail ?? {};
            if (node == undefined || left == undefined || top == undefined) {
                console.error("[NavigatorUpdateNode] params not provided!");
                return;
            }

            this.updateNode(node, left, top);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorRemoveNode, (event) => {
            const node = event.detail?.node;
            if (node == undefined) {
                console.error("[NavigatorRemoveNode] not node provided!");
                return;
            }

            this.removeNode(node);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorChangeMoveMode, (event) => {
            if (event?.detail?.moveMode == undefined) {
                console.error(
                    "[NavigatorChangeMoveMode] unexpected params!",
                    event
                );
                return;
            }
            this.changeMoveMode(event.detail.moveMode);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorMoveWhenAtEdge, () => {
            if (this.moveWhenAtEdge++ > 0) {
                console.warn(
                    "[NavigatorMoveWhenAtEdge] more than one setting MoveWhenAtEdge!"
                );
            }
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorCancelMoveWhenAtEdge, () => {
            if (this.moveWhenAtEdge === 0) {
                console.error("[NavigatorCancelMoveWhenAtEdge] cannot cancel!");
                return;
            }
            this.moveWhenAtEdge--;
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorZoomIn, () => {
            this.zoomIn();
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorZoomOut, () => {
            this.zoomOut();
        });

        MESSAGE_HANDLER(
            MESSAGE_TYPE.NavigatorZoomTo100,
            this.zoomTo100.bind(this)
        );

        MESSAGE_HANDLER(
            MESSAGE_TYPE.NavigatorViewAllFit,
            this.viewAllFit.bind(this)
        );

        ADD_KEY_HANDLER(DEFAULT_KEY_NAMESPACE, "+", [], this.zoomIn.bind(this));
        ADD_KEY_HANDLER(DEFAULT_KEY_NAMESPACE, "=", [], this.zoomIn.bind(this)); // =+ button

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "-",
            [],
            this.zoomOut.bind(this)
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "ArrowUp",
            [],
            this.toUp.bind(this)
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "ArrowDown",
            [],
            this.toDown.bind(this)
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "ArrowLeft",
            [],
            this.toLeft.bind(this)
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "ArrowRight",
            [],
            this.toRight.bind(this)
        );

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "Home",
            [],
            this.backToOrigin.bind(this)
        );

        document.documentElement.addEventListener("mousemove", (event) => {
            this.edgeStatus = 0;
            if (!this.moveWhenAtEdge) {
                return;
            }
            const clientX = event.clientX;
            const clientY = event.clientY;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            if (clientX <= NAVIGATOR_EDGE_WIDTH) {
                this.edgeStatus = this.edgeStatus ^ 1;
            }
            if (windowWidth - clientX <= NAVIGATOR_EDGE_WIDTH) {
                this.edgeStatus = this.edgeStatus ^ 2;
            }
            if (clientY <= NAVIGATOR_EDGE_WIDTH) {
                this.edgeStatus = this.edgeStatus ^ 4;
            }
            if (windowHeight - clientY <= NAVIGATOR_EDGE_WIDTH) {
                this.edgeStatus = this.edgeStatus ^ 8;
            }
        });
    }

    addNode(node, left, top) {
        if (node.element) {
            this.canvasEle.appendChild(node.element);
            this.jsPlumbInstance.manage(node.element, node.id);
        }

        if (!this.nodeTree.insert(left, top, node)) {
            console.error("[Navigator] detect error in addNode.");
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.ERROR,
                iconSvg: NAVIGATOR_ICON,
                content: "Detect error during adding node, please contact us!",
                timeout: 2000,
            });
        }
    }

    updateNode(node, left, top) {
        if (!this.nodeTree.update(left, top, node)) {
            console.error("[Navigator] detect error in updateNode.");
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.ERROR,
                iconSvg: NAVIGATOR_ICON,
                content:
                    "Detect error during updating node, please contact us!",
                timeout: 2000,
            });
        }
    }

    removeNode(node) {
        if (node.element) {
            this.jsPlumbInstance.removeAllEndpoints(node.element);
            this.jsPlumbInstance.unmanage(node.element);
        }

        if (!this.nodeTree.remove(node)) {
            console.error("[Navigator] detect error in deleteNode.");
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.ERROR,
                iconSvg: NAVIGATOR_ICON,
                content:
                    "Detect error during deleting node, please contact us!",
                timeout: 2000,
            });
        }
    }

    getNodesFromRange(left, top, width, height) {
        return this.nodeTree.query(left, top, width, height);
    }

    #createSelectBoxEle() {
        const selectBoxEle = document.createElement("div");
        selectBoxEle.className = "select-box";
        return selectBoxEle;
    }

    hideSelectBox() {
        this.selectBoxEle.style.display = "none";
    }

    showSelectBox(offsetLeft0, offsetTop0, offsetLeft1, offsetTop1) {
        const scale = this.getCanvasScale();
        const point = this.viewportPointToCanvas({
            x: Math.min(offsetLeft0, offsetLeft1),
            y: Math.min(offsetTop0, offsetTop1),
        });
        const width = Math.abs(offsetLeft1 - offsetLeft0) / scale;
        const height = Math.abs(offsetTop1 - offsetTop0) / scale;

        this.selectBoxEle.style.display = "inline";
        this.selectBoxEle.style.left = `${point.x}px`;
        this.selectBoxEle.style.top = `${point.y}px`;
        this.selectBoxEle.style.width = `${width}px`;
        this.selectBoxEle.style.height = `${height}px`;

        if (width > 0 && height > 0) {
            MESSAGE_PUSH(MESSAGE_TYPE.SelectNodes, {
                nodes: this.getNodesFromRange(point.x, point.y, width, height),
            });
        }
    }

    changeViewportBackground(scale, offsetLeft, offsetTop) {
        MESSAGE_PUSH(MESSAGE_TYPE.ChangeChecksBackground, {
            scale: scale,
            offsetLeft: offsetLeft,
            offsetTop: offsetTop,
        });
    }

    handleMiddleMouseScrollAndZoom(e) {
        if (e.target === this.viewportEle) {
            const scale = this.getCanvasScale();
            if (e.ctrlKey) {
                // zoom
                const viewportPoint = {
                    x: e.clientX,
                    y: e.clientY,
                };
                if (e.wheelDeltaY > 0) {
                    this.zoomIn(viewportPoint);
                } else {
                    this.zoomOut(viewportPoint);
                }
                e.preventDefault();
                e.stopPropagation();
            } else {
                // scroll
                let { left, top } = this.getCanvasBounds();
                if (e.wheelDeltaY > 0) {
                    top += NAVIGATOR_CHANGE_INTERVAL_DISTANCE / scale;
                } else {
                    top -= NAVIGATOR_CHANGE_INTERVAL_DISTANCE / scale;
                }
                this.setCanvasLocationAndScale(left, top, scale);
            }
        }
    }

    handleViewportPointerDown(e) {
        const rate =
            window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;
        if (e.target === this.viewportEle) {
            let firstMove = true;
            if (this.moveMode ^ e.ctrlKey) {
                // move
                let x = 0;
                let y = 0;
                this.viewportEle.onpointermove = (moveEvent) => {
                    if (moveEvent.buttons !== 1) {
                        this.handleViewportPointerUp(moveEvent);
                        return;
                    }
                    // anti-shake
                    if (Math.abs(x) > 5 || Math.abs(y) > 5) {
                        this.pan(
                            moveEvent.movementX / rate,
                            moveEvent.movementY / rate
                        );
                        if (firstMove) {
                            this.viewportEle.style.cursor = "grabbing";
                            this.viewportEle.setPointerCapture(
                                moveEvent.pointerId
                            );
                            firstMove = false;
                        }
                    } else {
                        x += moveEvent.movementX * rate;
                        y += moveEvent.movementY * rate;
                    }
                };
            } else {
                // selectBox
                let originX = e.clientX;
                let originY = e.clientY;
                let currentX = e.clientX;
                let currentY = e.clientY;
                const prevScale = this.getCanvasScale();
                const { left: prevLeft, top: preTop } = this.getCanvasBounds();

                this.selectBoxUpdateHandler = () => {
                    const scale = this.getCanvasScale();
                    let { left, top } = this.getCanvasBounds();
                    this.showSelectBox(
                        originX + (left * scale - prevLeft * prevScale),
                        originY + (top * scale - preTop * prevScale),
                        Math.max(0, Math.min(window.innerWidth, currentX)),
                        Math.max(0, Math.min(window.innerHeight, currentY))
                    );
                    if (this.selectBoxUpdateHandler) {
                        CALL_BEFORE_NEXT_FRAME(
                            NAVIGATOR_MOVE_FRAME_QUEUE_WEIGHT,
                            this.selectBoxUpdateHandler
                        );
                    } else {
                        this.hideSelectBox();
                    }
                };
                this.moveWhenAtEdge += 1;

                this.viewportEle.onpointermove = (moveEvent) => {
                    if (moveEvent.buttons !== 1) {
                        this.handleViewportPointerUp(moveEvent);
                        return;
                    }

                    currentX = moveEvent.clientX;
                    currentY = moveEvent.clientY;

                    if (firstMove) {
                        this.viewportEle.setPointerCapture(moveEvent.pointerId);
                        CALL_BEFORE_NEXT_FRAME(
                            NAVIGATOR_MOVE_FRAME_QUEUE_WEIGHT,
                            this.selectBoxUpdateHandler
                        );
                        firstMove = false;
                    }
                };
            }
        }
    }

    handleViewportPointerUp(e) {
        if (this.selectBoxUpdateHandler) {
            this.selectBoxUpdateHandler = null;
            this.moveWhenAtEdge -= 1;
        }
        this.viewportEle.onpointermove = null;
        this.viewportEle.releasePointerCapture(e.pointerId);
        this.viewportEle.style.cursor = null;
    }

    handleViewportRightKeyMenu(e) {
        if (e.target !== this.viewportEle) return true;
        MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
            showLeft: e.clientX,
            showTop: e.clientY,
            items: [
                {
                    title: "Paste",
                    keyTips: "Ctrl+V",
                    icon: ICONS.paste,
                    callback: MEMORY_GET(MEMORY_KEYS.CanPasteNodes, false)
                        ? () => {
                              MESSAGE_PUSH(MESSAGE_TYPE.NodesPaste, {
                                  left: e.clientX,
                                  top: e.clientY,
                              });
                          }
                        : undefined,
                },
                {
                    title: "Paste from Clipboard",
                    icon: ICONS.import,
                    callback: async () => {
                        try {
                            const clipboardData =
                                await navigator.clipboard.readText();
                            MESSAGE_PUSH(MESSAGE_TYPE.ImportGraph, {
                                default: clipboardData,
                            });
                        } catch (err) {
                            console.warn("[Navigator] read clipboard fail!", {
                                err: err,
                            });
                            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                                config: PROMPT_CONFIG.WARNING,
                                content:
                                    'Read clipboard fail, please using "Import" to paste!',
                                timeout: 2000,
                            });
                        }
                    },
                },
                {
                    title: "Select All",
                    keyTips: "Ctrl+A",
                    icon: ICONS.selectAll,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SelectNodes);
                    },
                },
                {
                    title: "Undo",
                    keyTips: "Ctrl+Z",
                    icon: ICONS.undo,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OperationUndo);
                    },
                    disabled: !MEMORY_GET(MEMORY_KEYS.CanUndoOperation, false),
                },
                {
                    title: "Save",
                    keyTips: "Ctrl+S",
                    icon: ICONS.save,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph);
                    },
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Zoom In",
                    keyTips: "+/=",
                    icon: ICONS.zoomIn,
                    callback: this.zoomIn.bind(this),
                },
                {
                    title: "Zoom Out",
                    keyTips: "-",
                    icon: ICONS.zoomOut,
                    callback: this.zoomOut.bind(this),
                },
                {
                    title: "Zoom to 100%",
                    icon: ICONS.zoomTo100,
                    callback: this.zoomTo100.bind(this),
                },
                {
                    title: "Back to Origin",
                    keyTips: "Home",
                    icon: ICONS.backToOrigin,
                    callback: this.backToOrigin.bind(this),
                },
                {
                    title: "View All",
                    icon: ICONS.viewAllFit,
                    callback: this.viewAllFit.bind(this),
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Import",
                    icon: ICONS.import,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ImportGraph),
                },
                {
                    title: "Export",
                    icon: ICONS.export,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ExportGraph),
                },
                {
                    title: "Tidy",
                    icon: ICONS.tidy,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.TidyNodes),
                },
                {
                    title: "Graph",
                    icon: ICONS.graph,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.CalculateGraph),
                },
            ],
        });
        return false;
    }

    refresh() {
        if (
            this.canvasTransform &&
            this.canvasTransform !== this.canvasEle.style.transform
        ) {
            this.canvasEle.style.transform = this.canvasTransform;
        }
        this.edgeHighlight.setEdges(this.edgeStatus);
        if (this.moveWhenAtEdge && this.edgeStatus) {
            const scale = this.getCanvasScale();
            let { left, top } = this.getCanvasBounds();
            let leftOffset = 0;
            let topOffset = 0;
            const LREdgeStatus = this.edgeStatus % 4;
            const TBEdgeStatus = this.edgeStatus >> 2;
            if (LREdgeStatus & 1) {
                leftOffset += this.moveSpeedAtEdge;
            }
            if (LREdgeStatus & 2) {
                leftOffset -= this.moveSpeedAtEdge;
            }
            if (TBEdgeStatus & 1) {
                topOffset += this.moveSpeedAtEdge;
            }
            if (TBEdgeStatus & 2) {
                topOffset -= this.moveSpeedAtEdge;
            }
            top += topOffset / scale;
            left += leftOffset / scale;
            this.setCanvasLocationAndScale(left, top, scale);
            this.moveSpeedAtEdge = Math.min(
                NAVIGATOR_MOVE_MAX_INTERVAL_DISTANCE,
                this.moveSpeedAtEdge + NAVIGATOR_MOVE_ADD_INTERVAL_DISTANCE
            );
        } else {
            this.moveSpeedAtEdge = NAVIGATOR_MOVE_BASE_INTERVAL_DISTANCE;
        }
    }
    refreshHandler = this.refresh.bind(this);

    startAnimationFrame() {
        CALL_BEFORE_EVERY_FRAME(
            NAVIGATOR_FRAME_QUEUE_WEIGHT,
            this.refreshHandler
        );
    }

    stopAnimationFrame() {
        this.canvasTransform = undefined;
        DELETE_FRAME_HANDLER(NAVIGATOR_FRAME_QUEUE_WEIGHT, this.refreshHandler);
    }

    getCanvasScale() {
        let scale = 1;
        const transform = this.canvasTransform;
        if (transform) {
            const index = transform.indexOf("scale(");
            if (index > -1) {
                scale = parseFloat(
                    transform.substring(
                        index + 6,
                        transform.indexOf(")", index)
                    )
                );
            }
        }
        return scale;
    }

    getCanvasBounds() {
        let left = 0;
        let top = 0;
        const transform = this.canvasTransform;
        if (transform) {
            const index = transform.indexOf("translate(");
            if (index > -1) {
                const offset = transform.substring(
                    index + 10,
                    transform.indexOf(")", index)
                );
                left = parseFloat(offset.split(",")[0]);
                top = parseFloat(offset.split(",")[1]);
            }
        }
        return {
            left,
            top,
            width: this.canvasEle.offsetWidth,
            height: this.canvasEle.offsetHeight,
        };
    }

    getCanvasActualBounds() {
        const canvasBounds = this.getCanvasBounds();
        const { left, top, width, height } =
            this.nodeTree.getExtremumBoundary();

        if (left === undefined) {
            return {
                err: "NULL",
                left: 0,
                top: 0,
                width: 0,
                height: 0,
            };
        }
        return {
            left: canvasBounds.left + left,
            top: canvasBounds.top + top,
            width: width,
            height: height,
        };
    }

    setCanvasLocation(left, top, force) {
        this.setCanvasLocationAndScale(left, top, this.getCanvasScale(), force);
    }

    setCanvasLocationAndScale(left, top, scale, force) {
        left = Math.min(
            CANVAS_MAX_LEFT,
            Math.max(left, CANVAS_MIN_LEFT + window.innerWidth / scale)
        );
        top = Math.min(
            CANVAS_MAX_TOP,
            Math.max(top, CANVAS_MIN_TOP + window.innerHeight / scale)
        );
        this.changeViewportBackground(scale, left, top);
        MESSAGE_PUSH(MESSAGE_TYPE.NavigationChanged, {
            scale: scale,
            left: left,
            top: top,
        });
        this.canvasTransform = `scale(${scale}) translate(${left}px, ${top}px)`;
        if (force) {
            this.canvasEle.style.transform = this.canvasTransform;
        }
    }

    getCanvasBoundsAndScale() {
        return {
            scale: this.getCanvasScale(),
            ...this.getCanvasBounds(),
        };
    }

    getViewportBounds() {
        return {
            left: 0,
            top: 0,
            width: this.viewportEle.offsetWidth,
            height: this.viewportEle.offsetHeight,
        };
    }

    viewportPointToCanvas(point) {
        const canvasBounds = this.getCanvasBounds();
        const canvasScale = this.getCanvasScale();
        return {
            x: point.x / canvasScale - canvasBounds.left,
            y: point.y / canvasScale - canvasBounds.top,
        };
    }

    pan(offsetX, offsetY) {
        const scale = this.getCanvasScale();
        const bounds = this.getCanvasBounds();
        const left = bounds.left + offsetX / scale;
        const top = bounds.top + offsetY / scale;
        this.setCanvasLocation(left, top);
    }

    getLegalCanvasScale(scale) {
        if (!Number.isNaN(scale)) {
            return Math.min(
                NAVIGATOR_MAX_SCALE,
                Math.max(scale, NAVIGATOR_MIN_SCALE)
            );
        }
        return NAVIGATOR_DEFAULT_SCALE;
    }

    zoomTo(scale, viewportPoint) {
        const viewportBounds = this.getViewportBounds();
        viewportPoint = viewportPoint ?? {
            x: viewportBounds.left + viewportBounds.width / 2,
            y: viewportBounds.top + viewportBounds.height / 2,
        };
        const canvasPoint = this.viewportPointToCanvas(viewportPoint);
        const left = viewportPoint.x - canvasPoint.x * scale;
        const top = viewportPoint.y - canvasPoint.y * scale;
        this.setCanvasLocationAndScale(left / scale, top / scale, scale);
        this.jsPlumbInstance.setZoom(scale);
    }

    zoomIn(viewportPoint) {
        this.zoomTo(
            this.getLegalCanvasScale(
                this.getCanvasScale() + NAVIGATOR_INTERVAL_SCALE
            ),
            viewportPoint
        );
    }

    zoomOut(viewportPoint) {
        this.zoomTo(
            this.getLegalCanvasScale(
                this.getCanvasScale() - NAVIGATOR_INTERVAL_SCALE
            ),
            viewportPoint
        );
    }

    zoomTo100() {
        this.zoomTo(1);
    }

    backToOrigin() {
        const scale = this.getCanvasScale();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        this.setCanvasLocation(
            screenWidth / scale / 2,
            screenHeight / scale / 2
        );
    }

    viewAllFit() {
        const viewportBounds = this.getViewportBounds();
        const canvasBounds = this.getCanvasBounds();
        const canvasActualBounds = this.getCanvasActualBounds();
        if (canvasActualBounds.hasOwnProperty("err")) {
            this.zoomTo100();
            return;
        }
        let scale = this.getLegalCanvasScale(
            Math.min(
                viewportBounds.width / canvasActualBounds.width,
                viewportBounds.height / canvasActualBounds.height
            )
        );

        const width = canvasActualBounds.width * scale;
        const height = canvasActualBounds.height * scale;
        const left =
            viewportBounds.left +
            (viewportBounds.width - width) / 2 -
            (canvasActualBounds.left - canvasBounds.left) * scale;
        let top;
        if (viewportBounds.height > height) {
            top =
                viewportBounds.top +
                (viewportBounds.height - height) / 2 -
                (canvasActualBounds.top - canvasBounds.top) * scale;
        } else {
            top =
                viewportBounds.top -
                (canvasActualBounds.top - canvasBounds.top) * scale;
        }
        this.setCanvasLocationAndScale(left / scale, top / scale, scale, true);
        this.jsPlumbInstance.setZoom(scale);

        MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
            config: PROMPT_CONFIG.INFO,
            iconSvg: NAVIGATOR_ICON,
            content: "View all nodes.",
            timeout: 1000,
        });

        return scale;
    }

    addCanvasLocation(diffLeft, diffTop) {
        const info = this.getCanvasBounds();
        this.setCanvasLocation(info.left + diffLeft, info.top + diffTop);
    }

    toUp() {
        this.addCanvasLocation(
            0,
            NAVIGATOR_CHANGE_INTERVAL_DISTANCE / this.getCanvasScale()
        );
    }

    toDown() {
        this.addCanvasLocation(
            0,
            -NAVIGATOR_CHANGE_INTERVAL_DISTANCE / this.getCanvasScale()
        );
    }

    toLeft() {
        this.addCanvasLocation(
            NAVIGATOR_CHANGE_INTERVAL_DISTANCE / this.getCanvasScale(),
            0
        );
    }

    toRight() {
        this.addCanvasLocation(
            -NAVIGATOR_CHANGE_INTERVAL_DISTANCE / this.getCanvasScale(),
            0
        );
    }

    dispose() {
        this.stopAnimationFrame();
        this.viewportEle.onpointerdown = null;
        this.viewportEle.onpointermove = null;
        this.viewportEle.onpointerup = null;
        this.viewportEle.removeEventListener(
            "mousewheel",
            this.middleMouseZoomHandle
        );
    }
}

(function () {
    window.createJsPlumbNavigator = (jsPlumbInstance, viewportEle) => {
        const navigator = new Navigator(jsPlumbInstance, viewportEle);

        window.createJsPlumbNavigator = () => {
            console.warn("Do not create JsPlumbNavigator more than once!");
            return navigator;
        };
        return navigator;
    };
})();
