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

    // covering
    CoveringShow: "covering-show",
    CoveringClose: "covering-close",

    // jsplumb-navigator
    NavigatorZoomIn: "navigator-zoom-in",
    NavigatorZoomOut: "navigator-zoom-out",
    NavigatorZoomTo100: "navigator-zoom-to-100",
    NavigatorViewAllFit: "navigator-view-all-fit",
    NavigatorManageNode: "navigator-manage-node",
    NavigatorUpdateNode: "navigator-update-node",
    NavigatorRemoveNode: "navigator-remove-node",
    NavigatorChangeMoveMode: "navigator-change-move-mode",
    NavigationChanged: "navigator-changed", // out
    NavigatorMoveModeChanged: "navigator-move-mode-changed", // out
    NavigatorMoveWhenAtEdge: "navigator-move-when-at-edge",
    NavigatorCancelMoveWhenAtEdge: "navigator-cancel-move-when-at-edge",

    // right-key-menu
    RightKeyMenuShow: "right-key-menu-show",
    RightKeyMenuClose: "right-key-menu-close",

    // theme-helper
    ThemeChange: "theme-change",

    // nodes-copy-helper
    NodesCopy: "nodes-copy",
    NodesPaste: "nodes-paste",

    // operator-bar-mini-map
    DeleteMapNode: "delete-map-node",
    RedrawMapNode: "redraw-map-node",

    // prompt
    PromptShow: "prompt-show",

    // port
    ImportGraph: "import-graph", // menu
    ExportGraph: "export-graph", // menu
    CheckImportGraph: "check-import-graph", // return

    // llm-code-generator
    LLMCodeGenerator: "llm-code-generator", // menu
};

const MESSAGE_HANDLER_MAP = new Map();

const MESSAGE_PUSH = (msgType, detail) => {
    MESSAGE_BUS.dispatchEvent(new CustomEvent(msgType, { detail: detail }));
};

const MESSAGE_CALL = (msgType, detail) => {
    const result = [];
    if (MESSAGE_HANDLER_MAP.get(msgType) === undefined) {
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
