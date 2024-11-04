(function () {
    const rootStyle = getComputedStyle(document.querySelector(":root"));
    rootStyle.var = (key) => rootStyle.getPropertyValue(key);

    class MiniMap {
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
            this.refresh(true);
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
            if (e.buttons !== 1) {
                this.miniMapEle.onpointermove = null;
                this.miniMapEle.releasePointerCapture(e.pointerId);
                return;
            }
            this.navigator.pan(
                -e.movementX / this.viewScale,
                -e.movementY / this.viewScale
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
                left: 4,
                top: 4,
                width: this.miniMapEle.offsetWidth - 8,
                height: this.miniMapEle.offsetHeight - 8,
            };
            const viewBounds = {};
            if (
                miniMapBounds.width / miniMapBounds.height >
                globalBounds.width / globalBounds.height
            ) {
                viewBounds.height = miniMapBounds.height;
                viewBounds.width =
                    viewBounds.height *
                    (globalBounds.width / globalBounds.height);
                viewBounds.left =
                    miniMapBounds.left +
                    (miniMapBounds.width - viewBounds.width) / 2;
                viewBounds.top = miniMapBounds.top;
            } else {
                viewBounds.width = miniMapBounds.width;
                viewBounds.height =
                    viewBounds.width /
                    (globalBounds.width / globalBounds.height);
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
            this.miniMapCanvasEle.style.transform =
                this.canvasEle.style.transform;
        }

        getNodesBoundsString() {
            if (
                !this.lastGetNodesBoundsStringTime ||
                Date.now() - this.lastGetNodesBoundsStringTime > 200
            ) {
                this.cacheNodesBoundsString = "";
                const elements =
                    this.navigator.jsPlumbInstance.getManagedElements();
                for (const key in elements) {
                    const ele = elements[key].el;
                    const left = parseInt(ele.offsetLeft);
                    const top = parseInt(ele.offsetTop);
                    const width = parseInt(ele.offsetWidth);
                    const height = parseInt(ele.offsetHeight);
                    this.cacheNodesBoundsString += `${left},${top},${width},${height},`;
                }
                this.lastGetNodesBoundsStringTime = Date.now();
            }
            return this.cacheNodesBoundsString;
        }

        createMiniMapViewportEle() {
            const ele = document.createElement("div");
            ele.className = "minimap-viewport";
            return ele;
        }

        createMiniMapCanvasEle() {
            const ele = document.createElement("div");
            ele.className = "minimap-canvas";
            ele.style.position = "absolute";
            ele.style.transformOrigin = "left top";
            return ele;
        }

        createNodeOutlineEle(bounds) {
            const ele = document.createElement("div");
            ele.className = "minimap-node-outline";
            ele.style.position = "absolute";
            ele.style.left = `${bounds.left}px`;
            ele.style.top = `${bounds.top}px`;
            ele.style.width = `${bounds.width}px`;
            ele.style.height = `${bounds.height}px`;
            ele.style.backgroundColor = "#00000050";
            return ele;
        }

        drawCanvasOutline() {
            this.miniMapCanvasEle.innerHTML = "";
            const fragment = document.createDocumentFragment();
            const elements =
                this.navigator.jsPlumbInstance.getManagedElements();
            for (const key in elements) {
                const ele = elements[key].el;
                const bounds = {
                    left: ele.offsetLeft,
                    top: ele.offsetTop,
                    width: ele.offsetWidth,
                    height: ele.offsetHeight,
                };
                fragment.appendChild(this.createNodeOutlineEle(bounds));
            }
            this.miniMapCanvasEle.appendChild(fragment);
        }

        refresh(force) {
            if (this.miniMapEle.style.display !== "none") {
                let redraw = false;
                let reLayout = false;
                const nodesBoundsString = this.getNodesBoundsString();
                if (nodesBoundsString !== this.nodesBoundsString) {
                    this.nodesBoundsString = nodesBoundsString;
                    redraw = true;
                    reLayout = true;
                }
                if (
                    this.canvasEle.style.transform !== this.canvasEleTransform
                ) {
                    this.canvasEleTransform = this.canvasEle.style.transform;
                    reLayout = true;
                }
                if (reLayout || force) {
                    if (redraw) {
                        this.drawCanvasOutline();
                    }
                    this.layout();
                }
                if (!this.isDisposed) {
                    this.animationFrameHandle = window.requestAnimationFrame(
                        () => this.refresh()
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
        zoomInSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666"><path d="M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" p-id="8525"></path><path d="M921 867L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" p-id="8526"></path></svg>`;
        zoomOutSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666"><path d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" p-id="8665"></path><path d="M921 867L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" p-id="8666"></path></svg>`;
        zoomTo100Svg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666"><path d="M316 672h60c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8zM512 622c22.1 0 40-17.9 40-39 0-23.1-17.9-41-40-41s-40 17.9-40 41c0 21.1 17.9 39 40 39zM512 482c22.1 0 40-17.9 40-39 0-23.1-17.9-41-40-41s-40 17.9-40 41c0 21.1 17.9 39 40 39z" p-id="8805"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32z m-40 728H184V184h656v656z" p-id="8806"></path><path d="M648 672h60c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8z" p-id="8807"></path></svg>`;
        viewAllFitSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666"><path d="M326 664H104c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V696c0-17.7-14.3-32-32-32zM342 88h-48c-8.8 0-16 7.2-16 16v176H104c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V104c0-8.8-7.2-16-16-16zM920 664H698c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V744h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zM920 280H746V104c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16z" p-id="9363"></path></svg>`;
        helpSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="#666" d="M11 18h2v-2h-2zm1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2a2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4"/></svg>`;

        constructor(operatorBar) {
            this.operatorBar = operatorBar;

            this.toolbarEle = document.createElement("div");
            this.toolbarEle.className = "toolbar";

            this.toolbarEle.appendChild(
                this.createTool("Zoom In", this.zoomInSvg, () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomIn);
                })
            );
            this.toolbarEle.appendChild(
                this.createTool("Zoom Out", this.zoomOutSvg, () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomOut);
                })
            );
            this.toolbarEle.appendChild(
                this.createTool("Zoom to 100%", this.zoomTo100Svg, () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomTo100);
                })
            );
            this.toolbarEle.appendChild(
                this.createTool("View All", this.viewAllFitSvg, () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
                })
            );
            this.toolbarEle.appendChild(
                this.createTool("Help", this.helpSvg, () => {
                    const linkEle = document.createElement("a");
                    linkEle.innerHTML =
                        "<p>Have a good time :)<br>You can learn how to use PMoS at here.<br>What's more, welcome to report any issue to us!</p>";

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

        show() {
            this.toolbarEle.style.display = "block";
        }

        hide() {
            this.toolbarEle.style.display = "none";
        }
    }

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

    function createControlBar() {
        const controlBarEle = document.createElement("div");
        controlBarEle.id = "control-bar";
        controlBarEle.className = "row-bar";

        const calculateButton = document.createElement("button");
        calculateButton.id = "calculate-button";
        calculateButton.className = "bar-button";
        calculateButton.textContent = "Calculate";
        calculateButton.style.flex = 2;
        calculateButton.addEventListener("click", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.CalculateGraph);
        });
        controlBarEle.appendChild(calculateButton);

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

        mainBarEle.appendChild(createControlBar());
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

        createMainBar(jsPlumbNavigator, viewportEle, canvasEle, {
            ...defaultOptions,
            ...options,
        });
    };
})();
