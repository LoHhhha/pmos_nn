const MESSAGE_BUS = document.createElement("div");

const MESSAGE_TYPE = {
    // checks-background
    ChangeChecksBackground: "change-checks-background",

    // graph
    CalculateGraph: "calculate-graph", // menu
    UpdateShape: "update-shape",
    TidyNodes: "tidy-nodes",

    // operator-bar
    ClearNodes: "clear-nodes", // menu
    CreateNodes: "create-nodes", // return
    DeleteNodes: "delete-nodes",
    SelectNodes: "select-nodes",
    HideOperatorBar: "hide-operator-bar",
    ShowOperatorBar: "show-operator-bar",
    VisibleOperatorBar: "visible-operator-bar", // return

    // covering
    CoveringShow: "covering-show",
    CoveringClose: "covering-close",

    // jsplumb-navigator
    NavigatorZoomIn: "navigator-zoom-in",
    NavigatorZoomOut: "navigator-zoom-out",
    NavigatorZoomTo100: "navigator-zoom-to-100",
    NavigatorViewAllFit: "navigator-view-all-fit",
    NavigatorBackToOrigin: "navigator-back-to-origin",
    NavigatorManageNode: "navigator-manage-node",
    NavigatorUpdateNode: "navigator-update-node",
    NavigatorRemoveNode: "navigator-remove-node",
    NavigatorChangeMoveMode: "navigator-change-move-mode",
    NavigatorCurrentMoveMode: "navigator-current-move-mode",
    NavigationInfo: "navigator-info", // return
    NavigationChanged: "navigator-changed", // out
    NavigatorMoveModeChanged: "navigator-move-mode-changed", // out
    NavigatorMoveWhenAtEdge: "navigator-move-when-at-edge",
    NavigatorCancelMoveWhenAtEdge: "navigator-cancel-move-when-at-edge",

    // right-key-menu
    RightKeyMenuShow: "right-key-menu-show",
    RightKeyMenuClose: "right-key-menu-close",

    // theme-helper
    ThemeChange: "theme-change",
    ThemeCurrent: "theme-current", // return

    // nodes-copy-helper
    NodesCopy: "nodes-copy",
    NodesPaste: "nodes-paste",

    // mini-map
    DeleteMapNode: "delete-map-node",
    RedrawMapNode: "redraw-map-node",
    HideMiniMap: "hide-mini-map",
    ShowMiniMap: "show-mini-map",
    VisibleMiniMap: "visible-mini-map", // return

    // prompt
    PromptShow: "prompt-show",
    PromptStop: "prompt-stop",
    PromptStart: "prompt-start",

    // port
    ImportGraph: "import-graph", // menu
    ImportNodes: "import-nodes",
    ExportGraph: "export-graph", // menu, return
    CheckImportGraph: "check-import-graph", // return

    // llm-code-generator
    LLMCodeGenerator: "llm-code-generator", // menu

    // undo-helper
    OperationSave: "operation-save",
    OperationUndo: "operation-undo",
    OperationRedo: "operation-redo",
    OperationRecordReset: "operation-record-reset",

    // graph-save-helper
    SaveGraph: "save-graph",
    GraphSaved: "graph-saved", // out
    OpenGraphs: "open-graphs",
    ResetCurrentSaveGraph: "reset-current-save-graph",

    // general-pages
    HelpPage: "help-page",
    ClearGraphPage: "clear-graph-page",
    SaveAsPage: "save-as-page",
    RestartPage: "restart-page",

    // tooltip
    AddTooltip: "add-tooltip",

    // general
    GraphChanged: "graph-changed", // out

    // i18n
    ChangeLanguage: "change-language",
    LanguageChanged: "language-changed", // out
    LanguageCurrent: "language-current",
};

const MESSAGE_HANDLER_MAP = new Map();

const MESSAGE_PUSH = (msgType, detail) => {
    MESSAGE_BUS.dispatchEvent(new CustomEvent(msgType, { detail: detail }));
};

const MESSAGE_CALL = (msgType, detail) => {
    const result = [];
    if (MESSAGE_HANDLER_MAP.get(msgType) === undefined) {
        console.warn(`[MessageBus] ${msgType} handler not found!`);
        return result;
    }
    for (const handler of MESSAGE_HANDLER_MAP.get(msgType)) {
        result.push(handler({ detail: detail }));
    }
    return result;
};

const MESSAGE_HANDLER = (msgType, handle) => {
    MESSAGE_BUS.addEventListener(msgType, handle);
    if (!MESSAGE_HANDLER_MAP.has(msgType)) MESSAGE_HANDLER_MAP.set(msgType, []);
    MESSAGE_HANDLER_MAP.get(msgType).push(handle);
};

(function () {
    window.addEventListener("load", () => {
        MESSAGE_BUS.id = "message-bus";
        MESSAGE_BUS.style.width = "0px";
        MESSAGE_BUS.style.height = "0px";
        MESSAGE_BUS.style.display = "none";
        document.body.appendChild(MESSAGE_BUS);
    });
})();
