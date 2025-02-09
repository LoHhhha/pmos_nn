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

class MiniMap {
    navigator;
    canvasEle;
    miniMapEle;
    miniMapViewportEle;
    miniMapCanvasEle;
    miniMapNodeEleMap;
    margin;

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

    constructor() {
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
                const readmeLinkEle = document.createElement("a");
                readmeLinkEle.innerHTML = "Instruction";
                readmeLinkEle.href = PMoS_FLOWING_INSTRUCTION_HREF;
                readmeLinkEle.target = "_blank";

                const repLinkEle = document.createElement("a");
                repLinkEle.innerHTML = "PMoS-nn Code Repository";
                repLinkEle.href = PMoS_REP_HREF;
                repLinkEle.target = "_blank";

                const jsPlumbLinkEle = document.createElement("a");
                jsPlumbLinkEle.innerHTML = "JsPlumb Code Repository";
                jsPlumbLinkEle.href = JS_PLUMB_REP_HREF;
                jsPlumbLinkEle.target = "_blank";

                MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                    title: "PMoS",
                    text: "Have a good time :)<br>Learn more about PMoS at the follow links.<br>What's more, welcome to report any issue to us!",
                    elements: [readmeLinkEle, repLinkEle, jsPlumbLinkEle],
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
        MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, { theme: THEME_STYLE.auto });

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

class NavigatorBarBuilder {
    static MoveModeSvg = ICONS.pointer;
    static SelectModeSvg = ICONS.select;

    ele;
    navigator;
    moveMode;
    infoEle;
    modeEle;
    constructor(navigator, ele) {
        this.ele = ele;
        this.navigator = navigator;

        this.infoEle = this.#createInfoEle();
        this.modeEle = this.#createModeEle();

        const rowBar = document.createElement("div");
        rowBar.className = "row-bar";
        rowBar.appendChild(this.infoEle);
        rowBar.appendChild(this.modeEle);

        this.ele.appendChild(rowBar);

        this.updateModeEle(true);
        navigator.changeMoveMode(true);

        this.updateInfoEle(navigator.getCanvasBoundsAndScale());
        this.addHandler();
    }

    updateInfoEle(info) {
        this.infoEle.innerHTML = `${info.scale.toFixed(2)}x<br>(${Math.floor(
            info.left
        )}, ${Math.floor(info.top)})`;
    }

    updateModeEle(moveMode) {
        this.moveMode = moveMode;
        this.modeEle.classList.remove("mode-bar-button-select");
        this.modeEle.classList.remove("mode-bar-button-move");
        if (moveMode === true) {
            this.modeEle.iconEle.innerHTML = NavigatorBarBuilder.MoveModeSvg;
            this.modeEle.titleEle.textContent = "Move";
            this.modeEle.classList.add("mode-bar-button-move");
        } else {
            this.modeEle.iconEle.innerHTML = NavigatorBarBuilder.SelectModeSvg;
            this.modeEle.titleEle.textContent = "Select";
            this.modeEle.classList.add("mode-bar-button-select");
        }
    }

    #createInfoEle() {
        const infoEle = document.createElement("div");
        infoEle.className = "bar-text";
        infoEle.id = "viewport-info-bar-text";
        return infoEle;
    }

    #createModeEle() {
        const modeEle = document.createElement("button");
        modeEle.classList.add("bar-button");
        modeEle.classList.add("row-bar");
        modeEle.id = "mode-bar-button";

        const iconEle = document.createElement("div");
        iconEle.id = "mode-bar-button-icon";

        const titleEle = document.createElement("div");
        titleEle.id = "mode-bar-button-title";

        modeEle.iconEle = iconEle;
        modeEle.titleEle = titleEle;

        modeEle.appendChild(iconEle);
        modeEle.appendChild(titleEle);

        modeEle.onclick = () => {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorChangeMoveMode, {
                moveMode: !this.moveMode,
            });
        };

        return modeEle;
    }

    addHandler() {
        MESSAGE_HANDLER(MESSAGE_TYPE.NavigationChanged, (event) => {
            this.updateInfoEle(event.detail);
        });
        MESSAGE_HANDLER(MESSAGE_TYPE.NavigatorMoveModeChanged, (event) => {
            this.updateModeEle(event.detail?.moveMode);
        });
    }
}

class ControlBarBuilder {
    ele;

    #createAIbar() {
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

    #createPortBar() {
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

    #createGraphBar() {
        const controlBarEle = document.createElement("div");
        controlBarEle.id = "graph-bar";
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

    #createCalcBar() {
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

    constructor(ele) {
        this.ele = ele;
        this.ele.appendChild(this.#createPortBar());
        this.ele.appendChild(this.#createAIbar());
        this.ele.appendChild(this.#createGraphBar());
        this.ele.appendChild(this.#createCalcBar());
    }

    hide() {
        controlBarEle.style.display = "none";
    }

    show() {
        this.toolbarEle.style.display = "block";
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
        if (!options.showMarBap) {
            miniMap.hide();
            toolbar.hide();
        }
        return mapBarEle;
    }

    function createNavigatorBar(jsPlumbNavigator, options) {
        const navigatorBarEle = document.createElement("div");
        navigatorBarEle.id = "navigator-bar";
        navigatorBarEle.className = "combo-bar";

        const navigatorBar = new NavigatorBarBuilder(
            jsPlumbNavigator,
            navigatorBarEle
        );

        if (!options.showNavigatorBar) {
            navigatorBar.hide();
        }

        return navigatorBarEle;
    }

    function createControlBar(options) {
        const controlBarEle = document.createElement("div");
        controlBarEle.className = "combo-bar";

        const controlBar = new ControlBarBuilder(controlBarEle);

        if (!options.showControlBar) {
            controlBar.hide();
        }

        return controlBarEle;
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

        mainBarEle.appendChild(createNavigatorBar(jsPlumbNavigator, options));

        mainBarEle.appendChild(createControlBar(options));

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
            showMarBap: true,
            showNavigatorBar: true,
            showControlBar: true,
        };

        return createMainBar(jsPlumbNavigator, viewportEle, canvasEle, {
            ...defaultOptions,
            ...options,
        });
    };
})();
