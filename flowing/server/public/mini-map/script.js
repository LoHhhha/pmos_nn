/**
 * MESSAGE_TYPE.DeleteMapNode
 *      <event.detail.id: str|int>
 *
 * MESSAGE_TYPE.RedrawMapNode
 *      <event.detail.id: str|int> <event.detail.left: int|float> <event.detail.top: int|float> <event.detail.width: int|float> <event.detail.height: int|float>
 *
 * MESSAGE_TYPE.HideMiniMap
 *
 * MESSAGE_TYPE.ShowMiniMap
 *
 * MESSAGE_TYPE.VisibleMiniMap -> bool
 */

const MINIMAP_NODE_UPDATE_FRAME_QUEUE_WEIGHT = 2;
const MINIMAP_FRAME_QUEUE_WEIGHT = 3;

class MiniMap {
    navigator;
    canvasEle;
    miniMapEle;
    miniMapViewportEle;
    miniMapCanvasEle;
    miniMapNodeEleMap;
    margin;

    constructor(navigator, viewportEle, canvasEle, options) {
        this.navigator = navigator;
        this.canvasEle = canvasEle;

        this.miniMapEle = document.createElement("div");
        this.miniMapEle.className = "minimap";
        if (options?.miniMapWidth !== undefined) {
            this.miniMapEle.style.width = `${options?.miniMapWidth}px`;
        }
        if (options?.miniMapHeight !== undefined) {
            this.miniMapEle.style.height = `${options?.miniMapHeight}px`;
        }

        const marginStyle = rootStyle.var("--margin");
        this.margin = parseInt(marginStyle.match(/\d+/));

        switch (options?.position) {
            case "top-left":
                this.miniMapEle.style.left = marginStyle;
                this.miniMapEle.style.top = marginStyle;
                break;
            case "top-right":
                this.miniMapEle.style.right = marginStyle;
                this.miniMapEle.style.top = marginStyle;
                break;
            case "bottom-left":
                this.miniMapEle.style.left = marginStyle;
                this.miniMapEle.style.bottom = marginStyle;
                break;
            default:
                this.miniMapEle.style.right = marginStyle;
                this.miniMapEle.style.bottom = marginStyle;
                break;
        }

        viewportEle.appendChild(this.miniMapEle);
        if (options?.showMiniMapAtFirst) {
            this.show();
        } else {
            this.hide();
        }

        this.miniMapNodeEleMap = new Map();

        this.miniMapViewportEle = this.createMiniMapViewportEle();
        this.miniMapCanvasEle = this.createMiniMapCanvasEle();

        this.miniMapViewportEle.appendChild(this.miniMapCanvasEle);
        this.miniMapEle.appendChild(this.miniMapViewportEle);
        this.miniMapEle.addEventListener(
            "mousewheel",
            this.handleMiddleMouseZoom.bind(this)
        );
        this.miniMapEle.onpointerdown = this.handlePointerDown.bind(this);
        this.miniMapEle.onpointerup = this.handlePointerUp.bind(this);

        this.addHandler();

        this.refresh(true);
    }

    addHandler() {
        MESSAGE_HANDLER(MESSAGE_TYPE.DeleteMapNode, (event) => {
            if (event.detail?.id === undefined) {
                console.error(
                    "[MiniMap-DeleteMapNode] get a unexpected event as",
                    event
                );
                return;
            }

            const node = this.miniMapNodeEleMap.get(event.detail.id);
            if (node === undefined) {
                console.warn(
                    "[MiniMap-DeleteMapNode] get a not exist node id."
                );
                return;
            }
            node.remove();
            this.miniMapNodeEleMap.delete(event.detail.id);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.RedrawMapNode, (event) => {
            if (
                event.detail?.id === undefined ||
                event.detail?.left === undefined ||
                event.detail?.top === undefined ||
                event.detail?.width === undefined ||
                event.detail?.height === undefined
            ) {
                console.error(
                    "[MiniMap-RedrawMapNode] get a unexpected event as",
                    event
                );
                return;
            }

            let node = this.miniMapNodeEleMap.get(event.detail.id);
            if (node === undefined) {
                console.debug(
                    "[MiniMap-RedrawMapNode] get a not exist node id, creating it."
                );
                node = this.createNodeOutlineEle(event.detail.id, event.detail);
            }

            CALL_BEFORE_NEXT_FRAME(
                MINIMAP_NODE_UPDATE_FRAME_QUEUE_WEIGHT,
                () => {
                    node.style.left = `${event.detail.left}px`;
                    node.style.top = `${event.detail.top}px`;
                    node.style.width = `${event.detail.width}px`;
                    node.style.height = `${event.detail.height}px`;
                    this.layout();
                }
            );
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ShowMiniMap, this.show.bind(this));
        MESSAGE_HANDLER(MESSAGE_TYPE.HideMiniMap, this.hide.bind(this));
        MESSAGE_HANDLER(MESSAGE_TYPE.VisibleMiniMap, () => this.visible);

        CALL_BEFORE_EVERY_FRAME(
            MINIMAP_FRAME_QUEUE_WEIGHT,
            this.refreshHandler
        );
    }

    handleMiddleMouseZoom(e) {
        if (e.wheelDeltaY > 0) {
            this.navigator.zoomIn();
        } else {
            this.navigator.zoomOut();
        }
        this.layout();
        e.preventDefault();
        e.stopPropagation();
    }

    handlePointerDown(e) {
        this.miniMapEle.onpointermove = this.handlePointerMove.bind(this);
        this.miniMapEle.style.cursor = "grabbing";
        this.miniMapEle.setPointerCapture(e.pointerId);
    }

    handlePointerMove(e) {
        const rate =
            window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;
        if (e.buttons !== 1) {
            this.miniMapEle.onpointermove = null;
            this.miniMapEle.releasePointerCapture(e.pointerId);
            return;
        }
        this.navigator.pan(
            -e.movementX / (rate * this.viewScale),
            -e.movementY / (rate * this.viewScale)
        );
        this.layout();
    }

    handlePointerUp(e) {
        this.miniMapEle.onpointermove = null;
        this.miniMapEle.releasePointerCapture(e.pointerId);
        this.miniMapEle.style.cursor = "grab";
    }

    layout() {
        const viewportBounds = this.navigator.getViewportBounds();
        const canvasActualBounds = this.navigator.getCanvasActualBounds();
        const canvasScale = this.navigator.getCanvasScale();
        const globalBounds = {
            left: Math.min(
                viewportBounds.left,
                canvasActualBounds.left * canvasScale
            ),
            top: Math.min(
                viewportBounds.top,
                canvasActualBounds.top * canvasScale
            ),
            right: Math.max(
                viewportBounds.left + viewportBounds.width,
                (canvasActualBounds.left + canvasActualBounds.width) *
                    canvasScale
            ),
            bottom: Math.max(
                viewportBounds.top + viewportBounds.height,
                (canvasActualBounds.top + canvasActualBounds.height) *
                    canvasScale
            ),
        };
        globalBounds.width = globalBounds.right - globalBounds.left;
        globalBounds.height = globalBounds.bottom - globalBounds.top;
        const miniMapBounds = {
            left: this.margin,
            top: this.margin,
            width: this.miniMapEle.offsetWidth - this.margin * 2,
            height: this.miniMapEle.offsetHeight - this.margin * 2,
        };
        const viewBounds = {};
        if (
            miniMapBounds.width / miniMapBounds.height >
            globalBounds.width / globalBounds.height
        ) {
            viewBounds.height = miniMapBounds.height;
            viewBounds.width =
                viewBounds.height * (globalBounds.width / globalBounds.height);
            viewBounds.left =
                miniMapBounds.left +
                (miniMapBounds.width - viewBounds.width) / 2;
            viewBounds.top = miniMapBounds.top;
        } else {
            viewBounds.width = miniMapBounds.width;
            viewBounds.height =
                viewBounds.width / (globalBounds.width / globalBounds.height);
            viewBounds.left = miniMapBounds.left;
            viewBounds.top =
                miniMapBounds.top +
                (miniMapBounds.height - viewBounds.height) / 2;
        }
        this.viewScale = viewBounds.width / globalBounds.width;
        this.miniMapViewportEle.style.left = `${viewBounds.left}px`;
        this.miniMapViewportEle.style.top = `${viewBounds.top}px`;
        this.miniMapViewportEle.style.width = `${viewportBounds.width}px`;
        this.miniMapViewportEle.style.height = `${viewportBounds.height}px`;
        this.miniMapViewportEle.style.transform = `scale(${
            this.viewScale
        }) translate(${-globalBounds.left}px, ${-globalBounds.top}px)`;
        this.miniMapCanvasEle.style.transform = this.canvasEle.style.transform;
    }

    createMiniMapViewportEle() {
        const ele = document.createElement("div");
        ele.className = "minimap-viewport";
        return ele;
    }

    createMiniMapCanvasEle() {
        const ele = document.createElement("div");
        ele.className = "minimap-canvas";
        return ele;
    }

    createNodeOutlineEle(id, bounds) {
        const ele = document.createElement("div");
        ele.className = "minimap-node-outline";
        ele.style.left = `${bounds.left}px`;
        ele.style.top = `${bounds.top}px`;
        ele.style.width = `${bounds.width}px`;
        ele.style.height = `${bounds.height}px`;
        this.miniMapNodeEleMap.set(id, ele);
        this.miniMapCanvasEle.appendChild(ele);
        return ele;
    }

    redrawAllNodes() {
        console.info("[MiniMap-RedrawAllNodes] redraw all nodes.");
        this.miniMapCanvasEle.innerHTML = "";
        this.miniMapNodeEleMap.clear();
        const elements = this.navigator.jsPlumbInstance.getManagedElements();
        for (const key in elements) {
            const ele = elements[key].el;
            const node = ele.origin;

            const bounds = {
                left: ele.offsetLeft,
                top: ele.offsetTop,
                width: ele.offsetWidth,
                height: ele.offsetHeight,
            };

            this.createNodeOutlineEle(node.id, bounds);
        }
    }

    refresh(force) {
        if (this.miniMapEle?.style.display !== "none") {
            let reLayout = false;
            if (this.canvasEle.style.transform !== this.canvasEleTransform) {
                this.canvasEleTransform = this.canvasEle.style.transform;
                reLayout = true;
            }
            if (reLayout || force) {
                this.layout();
            }
            if (force) {
                this.redrawAllNodes();
            }
        }
    }
    refreshHandler = this.refresh.bind(this);

    visible;
    show() {
        this.miniMapEle.classList.remove("minimap-hide-mode");
        this.visible = true;
    }
    hide() {
        this.miniMapEle.classList.add("minimap-hide-mode");
        this.visible = false;
    }

    dispose() {
        DELETE_FRAME_HANDLER(MINIMAP_FRAME_QUEUE_WEIGHT, this.refreshHandler);
        this.miniMapEle.onpointerdown = null;
        this.miniMapEle.onpointermove = null;
        this.miniMapEle.onpointerup = null;
        this.miniMapEle.removeEventListener(
            "mousewheel",
            this.handleMiddleMouseZoom
        );
        this.isDisposed = true;
    }
}

(function () {
    window.createMiniMap = (
        jsPlumbNavigator,
        viewportEle,
        canvasEle,
        options
    ) => {
        const defaultOptions = {
            position: "top-right", // [top / bottom]-[left / right]
            showMiniMapAtFirst: true,
            miniMapWidth: undefined,
            miniMapHeight: undefined,
        };

        return new MiniMap(jsPlumbNavigator, viewportEle, canvasEle, {
            ...defaultOptions,
            ...options,
        });
    };
})();
