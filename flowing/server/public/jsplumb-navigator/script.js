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
 *
 * MESSAGE_TYPE.NavigatorUpdateNode
 *      <event.detail.node>
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
 */

const NAVIGATOR_MIN_SCALE = 0.1;
const NAVIGATOR_MAX_SCALE = 3.0;
const NAVIGATOR_INTERVAL_SCALE = 0.1;
const NAVIGATOR_DEFAULT_SCALE = 1.0;
const NAVIGATOR_SCROLL_INTERVAL_DISTANCE = 50;
const NAVIGATOR_MOVE_BASE_INTERVAL_DISTANCE = 0;
const NAVIGATOR_MOVE_MAX_INTERVAL_DISTANCE = 64;

class Navigator {
    jsPlumbInstance;
    canvasEle;
    viewportEle;
    selectBoxEle;
    canvasTransform;
    moveMode;
    nodeTree = new QuadTree({
        left: CANVAS_MIN_LEFT,
        top: CANVAS_MIN_TOP,
        width: CANVAS_MAX_LEFT - CANVAS_MIN_LEFT,
        height: CANVAS_MAX_TOP - CANVAS_MIN_TOP,
    });

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

        this.#addChangeMoveModeHandler();

        this.changeMoveMode(true, false);

        this.startAnimationFrame();
        this.backToOrigin();
        this.viewAllFit();
    }

    changeMoveMode(moveMode, showPrompt = true) {
        if (moveMode) {
            this.hideSelectBox();
        }
        this.moveMode = moveMode;
        MESSAGE_PUSH(MESSAGE_TYPE.NavigatorMoveModeChanged, {
            moveMode: moveMode,
        });
        if (showPrompt) {
            MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
                config: PROMPT_CONFIG.INFO,
                content: `[Navigator] Change to "${
                    moveMode ? "Move" : "Select"
                }" viewport drag mode.`,
                timeout: 2000,
            });
        }
    }

    #addChangeMoveModeHandler() {
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
    }

    addNode(node) {
        if (node.element) {
            this.canvasEle.appendChild(node.element);
            this.jsPlumbInstance.manage(node.element, node.id);
        }

        const { left, top } = node.getCoordinates();
        this.nodeTree.insert(left, top, node);
    }

    updateNode(node) {
        const { left, top } = node.getCoordinates();
        this.nodeTree.update(left, top, node);
    }

    removeNode(node) {
        if (node.element) {
            this.jsPlumbInstance.removeAllEndpoints(node.element);
            this.jsPlumbInstance.unmanage(node.element);
        }

        this.nodeTree.remove(node);
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
        MESSAGE_PUSH(MESSAGE_TYPE.ChangeGridding, {
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
                    top += NAVIGATOR_SCROLL_INTERVAL_DISTANCE / scale;
                } else {
                    top -= NAVIGATOR_SCROLL_INTERVAL_DISTANCE / scale;
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
                let currentX, currentY;
                let overScreenMoveSpeed = NAVIGATOR_MOVE_BASE_INTERVAL_DISTANCE;

                this.viewportEle.selectBoxIntervalId = setInterval(() => {
                    const scale = this.getCanvasScale();
                    let { left, top } = this.getCanvasBounds();
                    let leftOffset = 0;
                    let topOffset = 0;
                    let overScreenBits = 3;
                    if (currentX >= window.innerWidth) {
                        leftOffset -= overScreenMoveSpeed;
                    } else if (currentX <= 0) {
                        leftOffset += overScreenMoveSpeed;
                    } else {
                        overScreenBits ^= 1;
                    }
                    if (currentY >= window.innerHeight) {
                        topOffset -= overScreenMoveSpeed;
                    } else if (currentY <= 0) {
                        topOffset += overScreenMoveSpeed;
                    } else {
                        overScreenBits ^= 2;
                    }
                    if (overScreenBits) {
                        originX += leftOffset;
                        originY += topOffset;
                        top += topOffset / scale;
                        left += leftOffset / scale;
                        this.setCanvasLocationAndScale(left, top, scale);
                        overScreenMoveSpeed = Math.min(
                            NAVIGATOR_MOVE_MAX_INTERVAL_DISTANCE,
                            overScreenMoveSpeed + 4
                        );
                        this.showSelectBox(
                            originX,
                            originY,
                            Math.max(0, Math.min(window.innerWidth, currentX)),
                            Math.max(0, Math.min(window.innerHeight, currentY))
                        );
                    } else {
                        overScreenMoveSpeed =
                            NAVIGATOR_MOVE_BASE_INTERVAL_DISTANCE;
                    }
                }, 50);

                this.viewportEle.onpointermove = (moveEvent) => {
                    if (moveEvent.buttons !== 1) {
                        this.handleViewportPointerUp(moveEvent);
                        return;
                    }

                    currentX = moveEvent.clientX;
                    currentY = moveEvent.clientY;

                    if (firstMove) {
                        this.viewportEle.setPointerCapture(moveEvent.pointerId);
                    }

                    this.showSelectBox(originX, originY, currentX, currentY);
                };
            }
        }
    }

    handleViewportPointerUp(e) {
        this.viewportEle.onpointermove = null;
        this.viewportEle.releasePointerCapture(e.pointerId);
        this.viewportEle.style.cursor = null;
        clearInterval(this.viewportEle.selectBoxIntervalId);
        this.hideSelectBox();
    }

    handleViewportRightKeyMenu(e) {
        if (e.target !== this.viewportEle) return true;
        MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
            showLeft: e.clientX,
            showTop: e.clientY,
            items: [
                {
                    title: "Paste",
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
                    title: "Zoom In",
                    callback: this.zoomIn.bind(this),
                },
                {
                    title: "Zoom Out",
                    callback: this.zoomOut.bind(this),
                },
                {
                    title: "zoom to 100%",
                    callback: this.zoomTo100.bind(this),
                },
                {
                    title: "Back to Origin",
                    callback: this.backToOrigin.bind(this),
                },
                {
                    title: "View All",
                    callback: this.viewAllFit.bind(this),
                },
                {
                    title: "Tidy Nodes",
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.TidyNodes),
                },
            ],
        });
        return false;
    }

    setCanvasTransform() {
        if (
            this.canvasTransform &&
            this.canvasTransform !== this.canvasEle.style.transform
        ) {
            this.canvasEle.style.transform = this.canvasTransform;
        }
        if (!this.isDisposed) {
            this.setCanvasTransformFrameHandle = window.requestAnimationFrame(
                () => this.setCanvasTransform()
            );
        }
    }

    startAnimationFrame() {
        this.setCanvasTransform();
    }

    stopAnimationFrame() {
        this.canvasTransform = undefined;
        if (this.setCanvasTransformFrameHandle) {
            window.cancelAnimationFrame(this.setCanvasTransformFrameHandle);
        }
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

        MESSAGE_PUSH(MESSAGE_TYPE.ShowDefaultPrompt, {
            config: PROMPT_CONFIG.INFO,
            content: "[Navigator] View all nodes",
            timeout: 1000,
        });

        return scale;
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
        this.isDisposed = true;
    }
}

(function () {
    window.createJsPlumbNavigator = (jsPlumbInstance, viewportEle) => {
        const navigator = new Navigator(jsPlumbInstance, viewportEle);

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorManageNode, (event) => {
            const node = event.detail.node;
            if (node == undefined) {
                console.error("[NavigatorManageNode] not node provided!");
                return;
            }
            navigator.addNode(node);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorUpdateNode, (event) => {
            const node = event.detail.node;
            if (node == undefined) {
                console.error("[NavigatorManageNode] not node provided!");
                return;
            }
            navigator.updateNode(node);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorRemoveNode, (event) => {
            const node = event.detail.node;
            if (node == undefined) {
                console.error("[NavigatorManageNode] not node provided!");
                return;
            }
            navigator.removeNode(node);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorZoomIn, () => {
            navigator.zoomIn();
        });
        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorZoomOut, () => {
            navigator.zoomOut();
        });
        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorZoomTo100, () => {
            navigator.zoomTo100();
        });
        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorViewAllFit, () => {
            navigator.viewAllFit();
        });
        return navigator;
    };
})();
