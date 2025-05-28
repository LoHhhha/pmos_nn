class GraphInfoBarBuilder {
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

        MESSAGE_HANDLER(MESSAGE_TYPE.LanguageChanged, () => {
            if (this.isUnsavedMode) {
                this.unSavedMode();
            } else {
                this.savedMode(this.prevSaveTimestamp);
            }
        });

        setTimeout(() => {
            this.saveNameEle.onchange();
        }, 0);

        this.unSavedMode();
    }

    isUnsavedMode;
    prevSaveTimestamp;
    unSavedMode() {
        this.prevSaveTimeEle.classList.remove("tcb-graph-saved-text");
        this.prevSaveTimeEle.classList.add("tcb-graph-unsaved-text");
        this.prevSaveTimeEle.textContent = I18N_STRINGS.unsaved_changes;
        if (this.prevSaveTimestamp) {
            this.prevSaveTimeEle.textContent +=
                I18N_STRINGS.prev_save_time_format?.format(
                    new Date(this.prevSaveTimestamp).toLocaleString()
                );
        }
        this.prevSaveTimeEle.onclick = () => {
            MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph);
        };
        this.isUnsavedMode = true;
    }
    savedMode(timestamp) {
        this.prevSaveTimeEle.classList.remove("tcb-graph-unsaved-text");
        this.prevSaveTimeEle.classList.add("tcb-graph-saved-text");
        this.prevSaveTimeEle.textContent =
            I18N_STRINGS.save_time_format?.format(
                timestamp && new Date(timestamp).toLocaleString()
            );
        this.prevSaveTimestamp = timestamp;
        this.prevSaveTimeEle.onclick = null;
        this.isUnsavedMode = false;
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
        ele.defaultValue = I18N_STRINGS.unnamed_graph;
        ele.placeholder = I18N_STRINGS.graph_name_placeholder;

        const changeSize = () => {
            ele.style.width = "0px";
            ele.style.width = `${Math.min(ele.scrollWidth + 1, maxWidth)}px`;
        };
        ele.oninput = changeSize;

        ele.onchange = (event) => {
            if (!ele.value) {
                ele.value = I18N_STRINGS.unnamed_graph;
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

        const info = MESSAGE_CALL(MESSAGE_TYPE.NavigationInfo).at(0);
        this.updateInfoEle(info);
        this.updateModeEle(info?.moveMode);

        this.addHandler();
    }

    updateInfoEle(info) {
        this.infoEle.innerHTML = `${Math.floor(-info?.left)},${Math.floor(
            -info?.top
        )} ${info?.scale.toFixed(2)}x`;
    }

    updateModeEle(moveMode) {
        this.moveMode = moveMode;
        this.modeEle.classList.remove("tcb-navigator-bar-mode-button-select");
        this.modeEle.classList.remove("tcb-navigator-bar-mode-button-move");
        if (moveMode === true) {
            this.modeEle.iconEle.innerHTML = NavigatorBarBuilder.MoveModeSvg;
            this.modeEle.classList.add("tcb-navigator-bar-mode-button-move");
        } else {
            this.modeEle.iconEle.innerHTML = NavigatorBarBuilder.SelectModeSvg;
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

        modeEle.iconEle = iconEle;
        modeEle.appendChild(iconEle);

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
    #createMenuButton(title_key, items, keyCode) {
        const button = document.createElement("div");
        button.className = "top-control-bar-menu-button";

        const setButtonInnerHTML = () => {
            button.innerHTML = `${
                I18N_STRINGS[title_key]
            }<small>(${keyCode.toUpperCase()})<\small>`;
        };
        setButtonInnerHTML();
        MESSAGE_HANDLER(MESSAGE_TYPE.LanguageChanged, setButtonInnerHTML);

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
            "graph",
            () => [
                {
                    title: I18N_STRINGS.save,
                    keyTips: "Ctrl+S",
                    icon: ICONS.save,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph);
                    },
                },
                {
                    title: I18N_STRINGS.save_as + "...",
                    icon: ICONS.saveAsNew,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.SaveAsPage);
                    },
                },
                {
                    isSeparator: true,
                },
                {
                    title: I18N_STRINGS.open + "...",
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OpenGraphs);
                    },
                },
                {
                    isSeparator: true,
                },
                {
                    title: I18N_STRINGS.import + "...",
                    icon: ICONS.import,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ImportGraph),
                },
                {
                    title: I18N_STRINGS.export + "...",
                    icon: ICONS.export,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ExportGraph),
                },
            ],
            "g"
        );

        this.#createMenuButton(
            "edit",
            () => [
                {
                    title: I18N_STRINGS.paste,
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
                    title: I18N_STRINGS.undo,
                    keyTips: "Ctrl+Z",
                    icon: ICONS.undo,
                    callback: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OperationUndo);
                    },
                    disabledCheck: () =>
                        !MEMORY_GET(MEMORY_KEYS.CanUndoOperation, false),
                },
                {
                    title: I18N_STRINGS.redo,
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
                    title: I18N_STRINGS.select_all,
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
            "view",
            () => {
                const moveMode = MESSAGE_CALL(
                    MESSAGE_TYPE.NavigatorCurrentMoveMode
                ).at(0);
                return [
                    {
                        title: I18N_STRINGS.zoom_in,
                        keyTips: "+/=",
                        icon: ICONS.zoomIn,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomIn);
                        },
                    },
                    {
                        title: I18N_STRINGS.zoom_out,
                        keyTips: "-",
                        icon: ICONS.zoomOut,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomOut);
                        },
                    },
                    {
                        title: I18N_STRINGS.zoom_to_100,
                        icon: ICONS.zoomTo100,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomTo100);
                        },
                    },
                    {
                        title: I18N_STRINGS.view_all,
                        icon: ICONS.viewAllFit,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
                        },
                    },
                    {
                        title: I18N_STRINGS.back_to_origin,
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
                        title: I18N_STRINGS.drag_mode,
                        icon: ICONS.drag,
                        subItems: [
                            {
                                title: I18N_STRINGS.move_mode,
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
                                title: I18N_STRINGS.select_mode,
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
            "tools",
            () => [
                {
                    title: I18N_STRINGS.clear_nodes,
                    icon: ICONS.clear,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.ClearGraphPage),
                },
                {
                    title: I18N_STRINGS.tidy_nodes,
                    icon: ICONS.tidy,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.TidyNodes),
                },
                {
                    isSeparator: true,
                },
                {
                    title: I18N_STRINGS.generate_graph,
                    icon: ICONS.chat,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.LLMCodeGenerator),
                },
                {
                    isSeparator: true,
                },
                {
                    title: I18N_STRINGS.export_to_code,
                    icon: ICONS.graph,
                    callback: () => MESSAGE_PUSH(MESSAGE_TYPE.CalculateGraph),
                },
            ],
            "t"
        );

        this.#createMenuButton(
            "settings",
            () => {
                const currentTheme = MESSAGE_CALL(MESSAGE_TYPE.ThemeCurrent).at(
                    0
                );
                const currentLanguage = MESSAGE_CALL(
                    MESSAGE_TYPE.LanguageCurrent
                ).at(0);
                const operationBarVisible = MESSAGE_CALL(
                    MESSAGE_TYPE.VisibleOperatorBar
                ).at(0);
                const miniMapVisible = MESSAGE_CALL(
                    MESSAGE_TYPE.VisibleMiniMap
                ).at(0);
                return [
                    {
                        title: I18N_STRINGS.operator_bar,
                        icon: ICONS.operatorBar,
                        subItems: [
                            {
                                title: I18N_STRINGS.show,
                                disabled: operationBarVisible,
                                underline: operationBarVisible,
                                icon: ICONS.show,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ShowOperatorBar);
                                },
                            },
                            {
                                title: I18N_STRINGS.hide,
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
                        title: I18N_STRINGS.mini_map,
                        icon: ICONS.map,
                        subItems: [
                            {
                                title: I18N_STRINGS.show,
                                disabled: miniMapVisible,
                                underline: miniMapVisible,
                                icon: ICONS.show,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ShowMiniMap);
                                },
                            },
                            {
                                title: I18N_STRINGS.hide,
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
                        title: I18N_STRINGS.theme,
                        icon: ICONS.theme,
                        subItems: [
                            {
                                title: I18N_STRINGS.dark_theme,
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
                                title: I18N_STRINGS.light_theme,
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
                                title: I18N_STRINGS.auto_theme,
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
                        title: I18N_STRINGS.language,
                        icon: ICONS.language,
                        subItems: [
                            {
                                title: I18N_STRINGS.english,
                                icon: ICONS.english,
                                underline:
                                    currentLanguage === LANGUAGES.english,
                                disabled: currentLanguage === LANGUAGES.english,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ChangeLanguage, {
                                        language: LANGUAGES.english,
                                    });
                                },
                            },
                            {
                                title: I18N_STRINGS.chinese,
                                icon: ICONS.chinese,
                                underline:
                                    currentLanguage === LANGUAGES.chinese,
                                disabled: currentLanguage === LANGUAGES.chinese,
                                callback: () => {
                                    MESSAGE_PUSH(MESSAGE_TYPE.ChangeLanguage, {
                                        language: LANGUAGES.chinese,
                                    });
                                },
                            },
                        ],
                    },
                    {
                        isSeparator: true,
                    },
                    {
                        title: I18N_STRINGS.restart,
                        callback: () => {
                            MESSAGE_PUSH(MESSAGE_TYPE.RestartPage);
                        },
                    },
                ];
            },
            "s"
        );

        this.#createMenuButton(
            "help",
            () => [
                {
                    title: I18N_STRINGS.about,
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
        this.#createSimpleItem(
            ICONS.zoomIn,
            () => I18N_STRINGS.zoom_in,
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomIn);
            }
        );
        this.#createSimpleItem(
            ICONS.zoomOut,
            () => I18N_STRINGS.zoom_out,
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomOut);
            }
        );
        this.#createSimpleItem(
            ICONS.zoomTo100,
            () => I18N_STRINGS.zoom_to_100,
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorZoomTo100);
            }
        );
        this.#createSimpleItem(
            ICONS.viewAllFit,
            () => I18N_STRINGS.view_all,
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorViewAllFit);
            }
        );
        this.#createSimpleItem(
            ICONS.backToOrigin,
            () => I18N_STRINGS.back_to_origin,
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.NavigatorBackToOrigin);
            }
        );
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
    window.initTopControlBar = () => {
        new ControlBar(document.getElementById("top-control-bar"));
        window.initTopControlBar = () => {
            console.warn(
                "[TopControlBar] calling initTopControlBar more than once is useless!"
            );
        };
    };
})();
