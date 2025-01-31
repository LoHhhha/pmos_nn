/**
 * MESSAGE_TYPE.CreateMapNode
 *      <event.detail.id: str|int> <event.detail.left: int|float> <event.detail.top: int|float> <event.detail.width: int|float> <event.detail.height: int|float>
 *
 * MESSAGE_TYPE.DeleteMapNode
 *      <event.detail.id: str|int>
 *
 * MESSAGE_TYPE.RedrawMapNode
 *      <event.detail.id: str|int> <event.detail.left: int|float> <event.detail.top: int|float> <event.detail.width: int|float> <event.detail.height: int|float>
 */

const HASH_MOD = 998244353;
const BASE = 1e6;

class MiniMap {
    navigator;
    canvasEle;
    miniMapEle;
    miniMapViewportEle;
    miniMapCanvasEle;
    miniMapNodeEleMap;

    constructor(navigator, canvasEle, miniMapWidth, miniMapHeight) {
        this.navigator = navigator;
        this.canvasEle = canvasEle;

        this.miniMapEle = document.createElement("div");
        this.miniMapEle.className = "minimap";
        if (miniMapWidth !== undefined) {
            this.miniMapEle.style.width = `${miniMapWidth}px`;
        } else {
            this.miniMapEle.style.width = `auto`;
        }
        miniMapHeight;
        if (miniMapHeight !== undefined) {
            this.miniMapEle.style.height = `${miniMapHeight}px`;
        } else {
            this.miniMapEle.style.height = `auto`;
        }

        this.margin = parseInt(rootStyle.var("--main-bar-margin").match(/\d+/));

        this.prevNodesInfoHash = 0;

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
        MESSAGE_HANDLER(MESSAGE_TYPE.CreateMapNode, (event) => {
            if (
                event.detail?.id === undefined ||
                event.detail?.left === undefined ||
                event.detail?.top === undefined ||
                event.detail?.width === undefined ||
                event.detail?.height === undefined
            ) {
                console.error(
                    "[MiniMap-CreateMapNode] get a unexpected event as",
                    event
                );
                return;
            }

            if (this.miniMapNodeEleMap.has(event.detail.id)) {
                console.warn(
                    "[MiniMap-CreateMapNode] get a exist node id, going to redraw this node."
                );
                MESSAGE_PUSH(MESSAGE_TYPE.RedrawMapNode, event.detail);
                return;
            }
            const node = this.createNodeOutlineEle(event.detail);
            this.miniMapNodeEleMap.set(event.detail.id, node);
            this.miniMapCanvasEle.appendChild(node);
            this.layout();
        });

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

            const node = this.miniMapNodeEleMap.get(event.detail.id);
            if (node === undefined) {
                console.warn(
                    "[MiniMap-RedrawMapNode] get a not exist node id."
                );
                return;
            }
            node.style.left = `${event.detail.left}px`;
            node.style.top = `${event.detail.top}px`;
            node.style.width = `${event.detail.width}px`;
            node.style.height = `${event.detail.height}px`;
        });
    }

    handleMiddleMouseZoom(e) {
        let scale = this.navigator.getCanvasScale();
        if (e.wheelDeltaY > 0) {
            scale += 0.1;
        } else {
            scale -= 0.1;
        }
        scale = this.navigator.getLegalCanvasScale(scale);
        this.navigator.zoomTo(scale);
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

    getNodesInfoHash() {
        let nodesInfoHash = 0;
        if (
            !this.lastGetNodesInfoHashTime ||
            Date.now() - this.lastGetNodesInfoHashTime > 200
        ) {
            const elements =
                this.navigator.jsPlumbInstance.getManagedElements();
            for (const key in elements) {
                const ele = elements[key].el;
                const left = parseInt(ele.offsetLeft);
                const top = parseInt(ele.offsetTop);
                const width = parseInt(ele.offsetWidth);
                const height = parseInt(ele.offsetHeight);
                nodesInfoHash =
                    (((nodesInfoHash * BASE) % HASH_MOD) + left + HASH_MOD) %
                    HASH_MOD;
                nodesInfoHash =
                    (((nodesInfoHash * BASE) % HASH_MOD) + top + HASH_MOD) %
                    HASH_MOD;
                nodesInfoHash =
                    (((nodesInfoHash * BASE) % HASH_MOD) + width + HASH_MOD) %
                    HASH_MOD;
                nodesInfoHash =
                    (((nodesInfoHash * BASE) % HASH_MOD) + height + HASH_MOD) %
                    HASH_MOD;
            }
            this.lastGetNodesInfoHashTime = Date.now();
        } else {
            nodesInfoHash = this.prevNodesInfoHash;
        }
        return nodesInfoHash;
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

    createNodeOutlineEle(bounds) {
        const ele = document.createElement("div");
        ele.className = "minimap-node-outline";
        ele.style.left = `${bounds.left}px`;
        ele.style.top = `${bounds.top}px`;
        ele.style.width = `${bounds.width}px`;
        ele.style.height = `${bounds.height}px`;
        return ele;
    }

    redrawAllNodes() {
        console.info("[MiniMap-RedrawAllNodes] redraw all nodes.");
        this.miniMapCanvasEle.innerHTML = "";
        this.miniMapNodeEleMap.clear();
        const elements = this.navigator.jsPlumbInstance.getManagedElements();
        for (const key in elements) {
            const ele = elements[key].el;

            const bounds = {
                left: ele.offsetLeft,
                top: ele.offsetTop,
                width: ele.offsetWidth,
                height: ele.offsetHeight,
            };

            const node = this.createNodeOutlineEle(bounds);
            this.miniMapCanvasEle.appendChild(node);
            this.miniMapNodeEleMap.set(ele.id, node);
        }
    }

    refresh(force) {
        if (this.miniMapEle?.style.display !== "none") {
            let reLayout = false;
            const nodesInfoHash = this.getNodesInfoHash();
            if (nodesInfoHash !== this.prevNodesInfoHash) {
                this.prevNodesInfoHash = nodesInfoHash;
                reLayout = true;
            }
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
            if (!this.isDisposed) {
                this.animationFrameHandle = window.requestAnimationFrame(() =>
                    this.refresh()
                );
            }
        }
    }

    show() {
        this.miniMapEle.style.display = "block";
    }

    hide() {
        this.miniMapEle.style.display = "none";
    }

    dispose() {
        window.cancelAnimationFrame(this.animationFrameHandle);
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

class Toolbar {
    static zoomInSvg = `<svg class="toolbar-button-svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" p-id="8525"></path><path d="M921 867L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" p-id="8526"></path></svg>`;
    static zoomOutSvg = `<svg class="toolbar-button-svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" p-id="8665"></path><path d="M921 867L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" p-id="8666"></path></svg>`;
    static zoomTo100Svg = `<svg class="toolbar-button-svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M316 672h60c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8zM512 622c22.1 0 40-17.9 40-39 0-23.1-17.9-41-40-41s-40 17.9-40 41c0 21.1 17.9 39 40 39zM512 482c22.1 0 40-17.9 40-39 0-23.1-17.9-41-40-41s-40 17.9-40 41c0 21.1 17.9 39 40 39z" p-id="8805"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32z m-40 728H184V184h656v656z" p-id="8806"></path><path d="M648 672h60c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8z" p-id="8807"></path></svg>`;
    static viewAllFitSvg = `<svg class="toolbar-button-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M17 4h3c1.1 0 2 .9 2 2v2h-2V6h-3zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v2zm16 8v2h-3v2h3c1.1 0 2-.9 2-2v-2zM7 18H4v-2H2v2c0 1.1.9 2 2 2h3zm9-8v4H8v-4zm2-2H6v8h12z"/></svg>`;
    static helpSvg = `<svg class="toolbar-button-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M11 18h2v-2h-2zm1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2a2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4"/></svg>`;
    static autoThemeSvg = `<svg class="toolbar-button-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M7.5 2c-1.79 1.15-3 3.18-3 5.5s1.21 4.35 3.03 5.5C4.46 13 2 10.54 2 7.5A5.5 5.5 0 0 1 7.5 2m11.57 1.5l1.43 1.43L4.93 20.5L3.5 19.07zm-6.18 2.43L11.41 5L9.97 6l.42-1.7L9 3.24l1.75-.12l.58-1.65L12 3.1l1.73.03l-1.35 1.13zm-3.3 3.61l-1.16-.73l-1.12.78l.34-1.32l-1.09-.83l1.36-.09l.45-1.29l.51 1.27l1.36.03l-1.05.87zM19 13.5a5.5 5.5 0 0 1-5.5 5.5c-1.22 0-2.35-.4-3.26-1.07l7.69-7.69c.67.91 1.07 2.04 1.07 3.26m-4.4 6.58l2.77-1.15l-.24 3.35zm4.33-2.7l1.15-2.77l2.2 2.54zm1.15-4.96l-1.14-2.78l3.34.24zM9.63 18.93l2.77 1.15l-2.53 2.19z"/></svg>`;
    static lightThemeSvg = `<svg class="toolbar-button-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M5 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1m.64 5l-.71.71a1 1 0 0 0 0 1.41a1 1 0 0 0 1.41 0l.71-.71A1 1 0 0 0 5.64 17M12 5a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1m5.66 2.34a1 1 0 0 0 .7-.29l.71-.71a1 1 0 1 0-1.41-1.41l-.66.71a1 1 0 0 0 0 1.41a1 1 0 0 0 .66.29m-12-.29a1 1 0 0 0 .7.29a1 1 0 0 0 .71-.29a1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.43 1.41ZM21 11h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m-2.64 6A1 1 0 0 0 17 18.36l.71.71a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41ZM12 6.5a5.5 5.5 0 1 0 5.5 5.5A5.51 5.51 0 0 0 12 6.5m0 9a3.5 3.5 0 1 1 3.5-3.5a3.5 3.5 0 0 1-3.5 3.5m0 3.5a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1"/></svg>`;
    static darkThemeSvg = `<svg class="toolbar-button-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="m17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3zm3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95zm-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31"/></svg>`;

    constructor(operatorBar) {
        this.operatorBar = operatorBar;

        this.toolbarEle = document.createElement("div");
        this.toolbarEle.className = "toolbar";

        this.toolbarEle.appendChild(
            this.createTool("Zoom In", Toolbar.zoomInSvg, () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomIn);
            })
        );
        this.toolbarEle.appendChild(
            this.createTool("Zoom Out", Toolbar.zoomOutSvg, () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomOut);
            })
        );
        this.toolbarEle.appendChild(
            this.createTool("Zoom to 100%", Toolbar.zoomTo100Svg, () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomTo100);
            })
        );
        this.toolbarEle.appendChild(
            this.createTool("View All", Toolbar.viewAllFitSvg, () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
            })
        );
        this.toolbarEle.appendChild(this.createThemeButton());
        this.toolbarEle.appendChild(
            this.createTool("Help", Toolbar.helpSvg, () => {
                const linkEle = document.createElement("a");
                linkEle.innerHTML =
                    "<a>Have a good time :)<br>You can learn how to use PMoS at here.<br>What's more, welcome to report any issue to us!</a>";

                linkEle.href = PMoS_HREF;
                linkEle.target = "_blank";

                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                    title: "PMoS",
                    elements: [linkEle],
                    buttonMode: COVERING_BUTTON_MODE.CloseButton,
                });
            })
        );
    }

    createTool(title, image, click) {
        const button = document.createElement("button");
        button.className = "toolbar-button";
        button.title = title;
        button.innerHTML = image;
        button.onclick = click;
        return button;
    }

    createThemeButton() {
        const button = this.createTool("Theme", Toolbar.autoThemeSvg, null);
        button.currentTheme = THEME_STYLE.auto;
        button.onclick = () => {
            switch (button.currentTheme) {
                case THEME_STYLE.auto:
                    button.currentTheme = THEME_STYLE.light;
                    button.innerHTML = Toolbar.lightThemeSvg;
                    MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
                        theme: THEME_STYLE.light,
                    });
                    break;
                case THEME_STYLE.light:
                    button.currentTheme = THEME_STYLE.dark;
                    button.innerHTML = Toolbar.darkThemeSvg;
                    MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
                        theme: THEME_STYLE.dark,
                    });
                    break;
                default:
                    button.currentTheme = THEME_STYLE.auto;
                    button.innerHTML = Toolbar.autoThemeSvg;
                    MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
                        theme: THEME_STYLE.auto,
                    });
                    break;
            }
        };
        return button;
    }

    show() {
        this.toolbarEle.style.display = "block";
    }

    hide() {
        this.toolbarEle.style.display = "none";
    }
}

(function () {
    const rootStyle = getComputedStyle(document.querySelector(":root"));
    rootStyle.var = (key) => rootStyle.getPropertyValue(key);

    function createMapBar(jsPlumbNavigator, canvasEle, options) {
        const mapBarEle = document.createElement("div");
        mapBarEle.id = "map-bar";
        mapBarEle.className = "row-bar";
        const toolbar = new Toolbar();
        const miniMap = new MiniMap(jsPlumbNavigator, canvasEle);
        switch (options.toolbarPosition) {
            case "left":
                mapBarEle.appendChild(toolbar.toolbarEle);
                mapBarEle.appendChild(miniMap.miniMapEle);
                break;
            default:
                mapBarEle.appendChild(miniMap.miniMapEle);
                mapBarEle.appendChild(toolbar.toolbarEle);
                break;
        }
        if (!options.showMiniMap) {
            miniMap.hide();
        }
        if (!options.showToolbar) {
            toolbar.hide();
        }
        return mapBarEle;
    }

    function createAIbar() {
        const AIBarEle = document.createElement("div");
        AIBarEle.id = "ai-bar";
        AIBarEle.className = "row-bar";

        const generateButton = document.createElement("button");
        generateButton.id = "generate-button";
        generateButton.className = "bar-button";
        generateButton.textContent = "Generate Network";
        generateButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Not Implemented",
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
            });
        });
        AIBarEle.appendChild(generateButton);

        return AIBarEle;
    }

    function createPortBar() {
        const portBarEle = document.createElement("div");
        portBarEle.id = "port-bar";
        portBarEle.className = "row-bar";

        const exportButton = document.createElement("button");
        exportButton.id = "export-button";
        exportButton.className = "bar-button";
        exportButton.textContent = "Export";
        exportButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Not Implemented",
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
            });
        });
        portBarEle.appendChild(exportButton);

        const importButton = document.createElement("button");
        importButton.id = "import-button";
        importButton.className = "bar-button";
        importButton.textContent = "Import";
        importButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Not Implemented",
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
            });
        });
        portBarEle.appendChild(importButton);

        return portBarEle;
    }

    function createControlBar() {
        const controlBarEle = document.createElement("div");
        controlBarEle.id = "control-bar";
        controlBarEle.className = "row-bar";

        const tidyButton = document.createElement("button");
        tidyButton.id = "tidy-button";
        tidyButton.className = "bar-button";
        tidyButton.textContent = "Tidy";
        tidyButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.TidyNodes);
        });
        controlBarEle.appendChild(tidyButton);

        const clearButton = document.createElement("button");
        clearButton.id = "clear-button";
        clearButton.className = "bar-button";
        clearButton.textContent = "Clear";
        clearButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Clear all node?",
                buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
                buttonCallback: {
                    confirm: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.ClearNode);
                    },
                },
            });
        });
        controlBarEle.appendChild(clearButton);

        return controlBarEle;
    }

    function createCalcBar() {
        const calcBarEle = document.createElement("div");
        calcBarEle.id = "calculation-bar";
        calcBarEle.className = "row-bar";

        const calculateButton = document.createElement("button");
        calculateButton.id = "calculate-button";
        calculateButton.className = "bar-button";
        calculateButton.textContent = "Calculate";
        calculateButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.CalculateGraph);
        });
        calcBarEle.appendChild(calculateButton);

        return calcBarEle;
    }

    function createMainBar(jsPlumbNavigator, viewportEle, canvasEle, options) {
        // main-bar
        const mainBarEle = document.createElement("div");
        mainBarEle.className = "main-bar";
        const margin = rootStyle.var("--main-bar-margin");
        switch (options.position) {
            case "top-left":
                mainBarEle.style.left = margin;
                mainBarEle.style.top = margin;
                break;
            case "top-right":
                mainBarEle.style.right = margin;
                mainBarEle.style.top = margin;
                break;
            case "bottom-left":
                mainBarEle.style.left = margin;
                mainBarEle.style.bottom = margin;
                break;
            default:
                mainBarEle.style.right = margin;
                mainBarEle.style.bottom = margin;
                break;
        }
        viewportEle.appendChild(mainBarEle);

        mainBarEle.appendChild(
            createMapBar(jsPlumbNavigator, canvasEle, options)
        );

        // mainBarEle.appendChild(createPortBar());
        // mainBarEle.appendChild(createAIbar());
        mainBarEle.appendChild(createControlBar());
        mainBarEle.appendChild(createCalcBar());
        return mainBarEle;
    }

    window.createMainBar = (
        jsPlumbNavigator,
        viewportEle,
        canvasEle,
        options
    ) => {
        const defaultOptions = {
            position: "top-right", // [top / bottom]-[left / right]
            toolbarPosition: "right", // left / right
            showMiniMap: true,
            showToolbar: true,
        };

        return createMainBar(jsPlumbNavigator, viewportEle, canvasEle, {
            ...defaultOptions,
            ...options,
        });
    };
})();
