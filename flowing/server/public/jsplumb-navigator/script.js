class Navigator {
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
        this.startAnimationFrame();
        this.viewAllFit();
    }

    changeViewportBackground(scale, offsetLeft, offsetTop) {
        const eventData = {
            scale: scale,
            offsetLeft: offsetLeft,
            offsetTop: offsetTop,
        };
        const changeEvent = new CustomEvent("change-gridding", {
            detail: eventData,
        });
        this.viewportEle.dispatchEvent(changeEvent);
    }

    handleMiddleMouseScrollAndZoom(e) {
        if (e.target == this.viewportEle) {
            let scale = this.getCanvasScale();
            if (e.ctrlKey) {
                if (e.wheelDeltaY > 0) {
                    scale += 0.1;
                } else {
                    scale -= 0.1;
                }
                scale = this.getLegalCanvasScale(scale);
                this.zoomTo(scale);
                e.preventDefault();
                e.stopPropagation();
            } else {
                let { left, top } = this.getCanvasBounds();
                if (e.wheelDeltaY > 0) {
                    top += 50 / scale;
                } else {
                    top -= 50 / scale;
                }
                this.setCanvasLocationAndScale(left, top, scale);
            }
        }
    }

    handleViewportPointerDown(e) {
        const rate =
            window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;
        if (e.target === this.viewportEle) {
            let x = 0;
            let y = 0;
            let firstMove = true;
            this.viewportEle.onpointermove = (e) => {
                if (e.buttons !== 1) {
                    this.viewportEle.onpointermove = null;
                    this.viewportEle.releasePointerCapture(e.pointerId);
                    return;
                }
                if (Math.abs(x) > 5 || Math.abs(y) > 5) {
                    this.pan(e.movementX / rate, e.movementY / rate);
                    if (firstMove) {
                        this.viewportEle.style.cursor = "grabbing";
                        this.viewportEle.setPointerCapture(e.pointerId);
                        firstMove = false;
                    }
                } else {
                    x += e.movementX * rate;
                    y += e.movementY * rate;
                }
            };
        }
    }

    handleViewportPointerUp(e) {
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
        let left, right, top, bottom;
        const canvasBounds = this.getCanvasBounds();
        const elements = this.jsPlumbInstance.getManagedElements();
        for (const key in elements) {
            const ele = elements[key].el;
            const offset = { left: ele.offsetLeft, top: ele.offsetTop };
            const size = {
                width: ele.offsetWidth,
                height: ele.offsetHeight,
            };
            left =
                left === undefined ? offset.left : Math.min(left, offset.left);
            top = top === undefined ? offset.top : Math.min(top, offset.top);
            right =
                right === undefined
                    ? offset.left + size.width
                    : Math.max(right, offset.left + size.width);
            bottom =
                bottom === undefined
                    ? offset.top + size.height
                    : Math.max(bottom, offset.top + size.height);
        }
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
            width: right - left,
            height: bottom - top,
        };
    }

    setCanvasLocation(left, top, force) {
        this.setCanvasLocationAndScale(left, top, this.getCanvasScale(), force);
    }

    setCanvasLocationAndScale(left, top, scale, force) {
        this.changeViewportBackground(scale, left, top);
        this.canvasTransform = `scale(${scale}) translate(${left}px, ${top}px)`;
        if (force) {
            this.canvasEle.style.transform = this.canvasTransform;
        }
    }

    getCanvasScaleBounds() {
        const scale = this.getCanvasScale();
        const bounds = this.getCanvasBounds();
        return {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width * scale,
            height: bounds.height * scale,
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
        if (!isNaN(scale)) {
            return Math.min(3.0, Math.max(scale, 0.1));
        }
        return 1.0;
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

    zoomIn() {
        this.zoomTo(this.getLegalCanvasScale(this.getCanvasScale() + 0.1));
    }

    zoomOut() {
        this.zoomTo(this.getLegalCanvasScale(this.getCanvasScale() - 0.1));
    }

    zoomTo100() {
        this.zoomTo(1);
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
        let top = 0;
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
