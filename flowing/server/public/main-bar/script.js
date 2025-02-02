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
    static zoomInSvg = ICONS.zoomIn;
    static zoomOutSvg = ICONS.zoomOut;
    static zoomTo100Svg = ICONS.zoomTo100;
    static viewAllFitSvg = ICONS.viewAllFit;
    static helpSvg = ICONS.help;
    static autoThemeSvg = ICONS.autoTheme;
    static lightThemeSvg = ICONS.lightTheme;
    static darkThemeSvg = ICONS.darkTheme;

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
            MESSAGE_PUSH(MESSAGE_TYPE.ExportGraph);
        });
        portBarEle.appendChild(exportButton);

        const importButton = document.createElement("button");
        importButton.id = "import-button";
        importButton.className = "bar-button";
        importButton.textContent = "Import";
        importButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.ImportGraph);
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

        mainBarEle.appendChild(createPortBar());
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
