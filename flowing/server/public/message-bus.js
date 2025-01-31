const MESSAGE_BUS = document.createElement("div");

const MESSAGE_TYPE = {
    // graph
    CalculateGraph: "calculate-graph",
    UpdateShape: "update-shape",
    TidyNodes: "tidy-nodes",

    // operator-bar
    ClearNode: "clear-node",
    CreateNodes: "create-nodes",
    DeleteNodes: "delete-nodes",
    SelectNodes: "select-nodes",

    // covering
    CoveringShowCustom: "covering-show-custom",
    CoveringClose: "covering-close",

    // jsplumb-navigator
    NavigatorZoomIn: "navigator-zoom-in",
    NavigatorZoomOut: "navigator-zoom-out",
    NavigatorZoomTo100: "navigator-zoom-to-100",
    NavigatorViewAllFit: "navigator-view-all-fit",

    // right-key-menu
    RightKeyMenuShow: "right-key-menu-show",
    RightKeyMenuClose: "right-key-menu-close",

    // theme-helper
    ThemeChange: "theme-change",

    // nodes-copy-helper
    NodesCopy: "nodes-copy",
    NodesPaste: "nodes-paste",

    // operator-bar-mini-map
    CreateMapNode: "create-map-node",
    DeleteMapNode: "delete-map-node",
    RedrawMapNode: "redraw-map-node",

    // prompt
    ShowDefaultPrompt: "show-default-prompt",
};

const MESSAGE_PUSH = (msgType, detail) => {
    MESSAGE_BUS.dispatchEvent(new CustomEvent(msgType, { detail: detail }));
};

const MESSAGE_HANDLER = (msgType, handle) => {
    MESSAGE_BUS.addEventListener(msgType, handle);
};

(function () {
    window.addEventListener("load", () => {
        MESSAGE_BUS.id = "message-bus";
        MESSAGE_BUS.style.width = 0;
        MESSAGE_BUS.style.height = 0;
        MESSAGE_BUS.style.display = "none";
        document.body.appendChild(MESSAGE_BUS);
    });
})();
