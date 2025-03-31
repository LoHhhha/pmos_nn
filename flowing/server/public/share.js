const SHARE_MEMORY = new Map();

const MEMORY_KEYS = {
    CanPasteNodes: "can-paste-nodes", // nodes-copy-helper
    Id2Node: "id-to-node", // operator-bar
    NodeInformation: "node-information", // operator-bar
    CanUndoOperation: "can-undo-operation", // undo-helper
    PrevMouseLeftButtonCoordinate: "prev-mouse-left-button-coordinate",
    PrevMouseRightButtonCoordinate: "prev-mouse-right-button-coordinate",
    PrevMouseMiddleButtonCoordinate: "prev-mouse-middle-button-coordinate",
    ConnectionCreateIgnore: "connection-create-ignore", // undo-helper
    ConnectionDeleteIgnore: "connection-delete-ignore", // undo-helper
};

function MEMORY_GET(key, default_value) {
    const ret = SHARE_MEMORY.get(key);
    return ret === undefined ? default_value : ret;
}

function MEMORY_SET(key, value) {
    SHARE_MEMORY.set(key, value);
}
