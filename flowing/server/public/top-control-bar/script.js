class GraphInfoBarBuilder {
    static unsavedText = "Unsaved changes! Click here to save.";
    static defaultGraphName = UNNAMED_GRAPH_NAME;

    ele;
    prevSaveTimeEle;
    saveNameEle;
    constructor(ele) {
        this.ele = ele;

        this.prevSaveTimeEle = this.#createPrevSaveTimeEle();
        this.saveNameEle = this.#createSaveNameEle();

        this.ele.appendChild(this.saveNameEle);
        this.ele.appendChild(this.prevSaveTimeEle);

        MESSAGE_HANDLER(MESSAGE_TYPE.GraphSaved, (event) => {
            this.savedMode(event.detail?.timestamp);
            this.saveNameEle.changeValue(event.detail?.name);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.GraphChanged, () => {
            this.unSavedMode();
        });

        setTimeout(() => {
            this.saveNameEle.onchange();
        }, 0);

        this.unSavedMode();
    }

    prevSaveTimestamp;
    unSavedMode() {
        this.prevSaveTimeEle.classList.remove("tcb-graph-saved-text");
        this.prevSaveTimeEle.classList.add("tcb-graph-unsaved-text");
        this.prevSaveTimeEle.textContent = GraphInfoBarBuilder.unsavedText;
        if (this.prevSaveTimestamp) {
            this.prevSaveTimeEle.textContent += ` (Last saved at ${new Date(
                this.prevSaveTimestamp
            ).toLocaleString()})`;
        }
        this.prevSaveTimeEle.onclick = () => {
            MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph);
        };
    }
    savedMode(timestamp) {
        this.prevSaveTimeEle.classList.remove("tcb-graph-unsaved-text");
        this.prevSaveTimeEle.classList.add("tcb-graph-saved-text");
        this.prevSaveTimeEle.textContent = `Saved at ${
            timestamp && new Date(timestamp).toLocaleString()
        }`;
        this.prevSaveTimestamp = timestamp;
        this.prevSaveTimeEle.onclick = null;
    }

    #createPrevSaveTimeEle() {
        const ele = document.createElement("div");
        ele.className = "tcb-text";
        return ele;
    }

    #createSaveNameEle() {
        const maxWidth = rootStyle
            .var("--tcb-graph-name-input-max-width")
            .match(/\d+/g)
            .map(parseInt)[0];

        const ele = document.createElement("input");
        ele.className = "tcb-graph-name-input";
        ele.defaultValue = GraphInfoBarBuilder.defaultGraphName;
        ele.placeholder = "Name";

        const changeSize = () => {
            ele.style.width = "0px";
            ele.style.width = `${Math.min(ele.scrollWidth + 1, maxWidth)}px`;
        };
        ele.oninput = changeSize;

        ele.onchange = (event) => {
            if (!ele.value) {
                ele.value = GraphInfoBarBuilder.defaultGraphName;
            }
            MEMORY_SET(MEMORY_KEYS.CurrentGraphSaveName, ele.value);
            changeSize();

            // change come from user, so unsavedMode.
            if (event !== undefined) {
                this.unSavedMode();
            }
        };

        ele.changeValue = (value) => {
            ele.value = value;
            ele.onchange();
        };

        return ele;
    }
}

class NavigatorBarBuilder {
    static MoveModeSvg = ICONS.pointer;
    static SelectModeSvg = ICONS.select;

    ele;
    moveMode;
    infoEle;
    modeEle;
    constructor(ele) {
        this.ele = ele;

        this.infoEle = this.#createInfoEle();
        this.modeEle = this.#createModeEle();

        this.ele.appendChild(this.infoEle);
        this.ele.appendChild(this.modeEle);

        this.updateModeEle(true);
        this.addHandler();
    }

    updateInfoEle(info) {
        this.infoEle.innerHTML = `${Math.floor(-info.left)},${Math.floor(
            -info.top
        )} ${info.scale.toFixed(2)}x`;
    }

    updateModeEle(moveMode) {
        this.moveMode = moveMode;
        this.modeEle.classList.remove("tcb-navigator-bar-mode-button-select");
        this.modeEle.classList.remove("tcb-navigator-bar-mode-button-move");
        if (moveMode === true) {
            this.modeEle.iconEle.innerHTML = NavigatorBarBuilder.MoveModeSvg;
            this.modeEle.titleEle.textContent = "Move";
            this.modeEle.classList.add("tcb-navigator-bar-mode-button-move");
        } else {
            this.modeEle.iconEle.innerHTML = NavigatorBarBuilder.SelectModeSvg;
            this.modeEle.titleEle.textContent = "Select";
            this.modeEle.classList.add("tcb-navigator-bar-mode-button-select");
        }
    }

    #createInfoEle() {
        const infoEle = document.createElement("div");
        infoEle.className = "tcb-text";
        return infoEle;
    }

    #createModeEle() {
        const modeEle = document.createElement("div");
        modeEle.className = "tcb-navigator-bar-mode-button";

        const iconEle = document.createElement("div");
        iconEle.className = "tcb-navigator-bar-mode-icon";

        const titleEle = document.createElement("div");
        titleEle.className = "tcb-navigator-bar-mode-title";

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

class MenuBarBuilder {
    barEle;

    constructor(ele) {
        this.barEle = ele;

        this.#createMenus();
    }

    menuButtonShowing = false;
    #createMenuButton(title, items, keyCode) {
        const button = document.createElement("div");
        button.className = "top-control-bar-menu-button";

        button.innerHTML = `${title}<small>(${keyCode.toUpperCase()})<\small>`;

        const showMenu = () => {
            MESSAGE_PUSH(MESSAGE_TYPE.RightKeyMenuShow, {
                showLeft: button.offsetLeft,
                showTop: button.offsetTop + button.offsetHeight,
                items: items instanceof Function ? items() : items,
                closeCallback: () => {
                    button.classList.remove(
                        "top-control-bar-menu-button-selected"
                    );
                    this.menuButtonShowing = false;
                },
            });
            button.classList.add("top-control-bar-menu-button-selected");
            this.menuButtonShowing = true;
        };

        button.onclick = () => {
            showMenu();
        };
        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            keyCode,
            [MODIFIER_KEY_CODE.alt],
            button.onclick
        );

        button.onmouseenter = () => {
            if (this.menuButtonShowing) {
                showMenu();
            }
        };

        this.barEle.appendChild(button);
    }

    #createMenus() {
        this.#createMenuButton(
            "Graph",
            [
                {
                    title: "Save",
                    keyTips: "Ctrl+S",
                    icon: ICONS.save,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph);
                    },
                },
                {
                    title: "Save As..",
                    icon: ICONS.saveAsNew,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SaveAsPage);
                    },
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Open...",
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OpenGraphs);
                    },
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Import...",
                    icon: ICONS.import,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ImportGraph),
                },
                {
                    title: "Clipboard Import",
                    icon: ICONS.import,
                    callback: async () => {
                        try {
                            const clipboardData =
                                await navigator.clipboard.readText();
                            MESSAGE_PUSH(MESSAGE_TYPE.ImportGraph, {
                                default: clipboardData,
                            });
                        } catch (err) {
                            console.warn(
                                "[TopControlBar] read clipboard fail!",
                                {
                                    err: err,
                                }
                            );
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
                    title: "Export...",
                    icon: ICONS.export,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ExportGraph),
                },
            ],
            "g"
        );

        this.#createMenuButton(
            "Edit",
            [
                {
                    title: "Paste",
                    keyTips: "Ctrl+V",
                    icon: ICONS.paste,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.NodesPaste);
                    },
                    disabledCheck: () =>
                        !MEMORY_GET(MEMORY_KEYS.CanPasteNodes, false),
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Undo",
                    keyTips: "Ctrl+Z",
                    icon: ICONS.undo,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OperationUndo);
                    },
                    disabledCheck: () =>
                        !MEMORY_GET(MEMORY_KEYS.CanUndoOperation, false),
                },
                {
                    title: "Redo",
                    keyTips: "Ctrl+Y",
                    icon: ICONS.redo,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OperationRedo);
                    },
                    disabledCheck: () =>
                        !MEMORY_GET(MEMORY_KEYS.CanRedoOperation, false),
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Select All",
                    keyTips: "Ctrl+A",
                    icon: ICONS.selectAll,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SelectNodes);
                    },
                },
            ],
            "e"
        );

        this.#createMenuButton(
            "View",
            () => {
                const moveMode = MESSAGE_CALL(
                    MESSAGE_TYPE.NavigatorCurrentMoveMode
                ).at(0);
                return [
                    {
                        title: "Zoom In",
                        keyTips: "+/=",
                        icon: ICONS.zoomIn,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomIn);
                        },
                    },
                    {
                        title: "Zoom Out",
                        keyTips: "-",
                        icon: ICONS.zoomOut,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomOut);
                        },
                    },
                    {
                        title: "Zoom to 100%",
                        icon: ICONS.zoomTo100,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomTo100);
                        },
                    },
                    {
                        title: "View All",
                        icon: ICONS.viewAllFit,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
                        },
                    },
                    {
                        title: "Back to Origin",
                        keyTips: "Home",
                        icon: ICONS.backToOrigin,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorBackToOrigin);
                        },
                    },
                    {
                        isSeparator: true,
                    },
                    {
                        title: "Drag Mode",
                        icon: ICONS.drag,
                        subItems: [
                            {
                                title: "Move",
                                disabled: moveMode,
                                undefined: moveMode,
                                icon: ICONS.pointer,
                                callback: () => {
                                    MESSAGE_PUSH(
                                        MESSAGE_TYPE.NavigatorChangeMoveMode,
                                        { moveMode: true }
                                    );
                                },
                            },
                            {
                                title: "Select",
                                disabled: !moveMode,
                                undefined: !moveMode,
                                icon: ICONS.select,
                                callback: () => {
                                    MESSAGE_PUSH(
                                        MESSAGE_TYPE.NavigatorChangeMoveMode,
                                        { moveMode: false }
                                    );
                                },
                            },
                        ],
                    },
                ];
            },
            "v"
        );

        this.#createMenuButton(
            "Tools",
            [
                {
                    title: "Clear Nodes",
                    icon: ICONS.clear,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ClearGraphPage),
                },
                {
                    title: "Tidy Nodes",
                    icon: ICONS.tidy,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.TidyNodes),
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Generate Graph",
                    icon: ICONS.chat,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.LLMCodeGenerator),
                },
                {
                    isSeparator: true,
                },
                {
                    title: "Export to Code",
                    icon: ICONS.graph,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.CalculateGraph),
                },
            ],
            "t"
        );

        this.#createMenuButton(
            "Settings",
            () => {
                const currentTheme = MESSAGE_CALL(MESSAGE_TYPE.ThemeCurrent).at(
                    0
                );
                const operationBarVisible = MESSAGE_CALL(
                    MESSAGE_TYPE.VisibleOperatorBar
                ).at(0);
                const miniMapVisible = MESSAGE_CALL(
                    MESSAGE_TYPE.VisibleMiniMap
                ).at(0);
                return [
                    {
                        title: "OperatorBar",
                        icon: ICONS.operatorBar,
                        subItems: [
                            {
                                title: "Show",
                                disabled: operationBarVisible,
                                underline: operationBarVisible,
                                icon: ICONS.show,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ShowOperatorBar);
                                },
                            },
                            {
                                title: "Hide",
                                disabled: !operationBarVisible,
                                underline: !operationBarVisible,
                                icon: ICONS.hide,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.HideOperatorBar);
                                },
                            },
                        ],
                    },
                    {
                        title: "MiniMap",
                        icon: ICONS.map,
                        subItems: [
                            {
                                title: "Show",
                                disabled: miniMapVisible,
                                underline: miniMapVisible,
                                icon: ICONS.show,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ShowMiniMap);
                                },
                            },
                            {
                                title: "Hide",
                                disabled: !miniMapVisible,
                                underline: !miniMapVisible,
                                icon: ICONS.hide,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.HideMiniMap);
                                },
                            },
                        ],
                    },
                    {
                        isSeparator: true,
                    },
                    {
                        title: "Theme",
                        icon: ICONS.theme,
                        subItems: [
                            {
                                title: "Dark",
                                icon: ICONS.darkTheme,
                                underline: currentTheme === THEME_STYLE.dark,
                                disabled: currentTheme === THEME_STYLE.dark,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
                                        theme: THEME_STYLE.dark,
                                    });
                                },
                            },
                            {
                                title: "Light",
                                icon: ICONS.lightTheme,
                                underline: currentTheme === THEME_STYLE.light,
                                disabled: currentTheme === THEME_STYLE.light,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
                                        theme: THEME_STYLE.light,
                                    });
                                },
                            },
                            {
                                title: "Auto",
                                icon: ICONS.autoTheme,
                                underline: currentTheme === THEME_STYLE.auto,
                                disabled: currentTheme === THEME_STYLE.auto,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
                                        theme: THEME_STYLE.auto,
                                    });
                                },
                            },
                        ],
                    },
                    {
                        isSeparator: true,
                    },
                    {
                        title: "Restart",
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.RestartPage);
                        },
                    },
                ];
            },
            "s"
        );

        this.#createMenuButton(
            "Help",
            [
                {
                    title: "About",
                    icon: ICONS.help,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.HelpPage);
                    },
                },
                {
                    isSeparator: true,
                },
                {
                    title: PMoS_VERSION,
                },
            ],
            "h"
        );
    }
}

class ToolBarBuilder {
    barEle;

    constructor(ele) {
        this.barEle = ele;

        this.#createItems();
    }

    #createSimpleItem(icon, tooltip, callback) {
        const item = document.createElement("div");
        item.className = "tcb-tool-bar-item";

        item.innerHTML = icon;
        MESSAGE_PUSH(MESSAGE_TYPE.AddTooltip, {
            element: item,
            textContent: tooltip,
        });
        item.onclick = callback;

        this.barEle.appendChild(item);
    }

    #createItems() {
        this.#createSimpleItem(ICONS.zoomIn, "Zoom In", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomIn);
        });
        this.#createSimpleItem(ICONS.zoomOut, "Zoom Out", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomOut);
        });
        this.#createSimpleItem(ICONS.zoomTo100, "Zoom to 100%", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomTo100);
        });
        this.#createSimpleItem(ICONS.viewAllFit, "View All Fit", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
        });
        this.#createSimpleItem(ICONS.backToOrigin, "Back to Origin", () => {
            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorBackToOrigin);
        });
    }
}

class ControlBar {
    barEle;

    constructor(barEle) {
        this.barEle = barEle;

        this.#createPMoSIcon();
        this.#createGraphInfoBar();
        this.#createMenuBar();
        this.#createToolBar();
        this.#createNavigatorBar();
    }

    #createPMoSIcon() {
        const icon = document.createElement("div");
        icon.className = "tcb-pmos";
        icon.textContent = "PMoS";

        icon.onclick = () => {
            window.open(PMoS_REP_HREF);
        };

        this.barEle.appendChild(icon);
    }

    #createGraphInfoBar() {
        const graphInfoBarEle = document.createElement("div");
        graphInfoBarEle.className = "tcb-graph-info-bar";

        new GraphInfoBarBuilder(graphInfoBarEle);

        this.barEle.appendChild(graphInfoBarEle);
    }

    #createMenuBar() {
        const menuBarEle = document.createElement("div");
        menuBarEle.className = "tcb-menu-bar";

        new MenuBarBuilder(menuBarEle);

        this.barEle.appendChild(menuBarEle);
    }

    #createToolBar() {
        const toolBarEle = document.createElement("div");
        toolBarEle.className = "tcb-tool-bar";

        new ToolBarBuilder(toolBarEle);

        this.barEle.appendChild(toolBarEle);
    }

    #createNavigatorBar() {
        const navigatorBarEle = document.createElement("div");
        navigatorBarEle.className = "tcb-navigator-bar";
        new NavigatorBarBuilder(navigatorBarEle);
        this.barEle.appendChild(navigatorBarEle);
    }
}

(function () {
    window.addEventListener("load", () => {
        new ControlBar(document.getElementById("top-control-bar"));
    });
})();
