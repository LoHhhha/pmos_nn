const SHARE_MEMORY = new Map();

const MEMORY_KEYS = {
    // memory
    CanPasteNodes: "can-paste-nodes", // nodes-copy-helper
    Id2Node: "id-to-node", // operator-bar
    NodeInformation: "node-information", // operator-bar
    CanUndoOperation: "can-undo-operation", // undo-helper
    CanRedoOperation: "can-redo-operation", // undo-helper
    PrevMouseLeftButtonCoordinate: "prev-mouse-left-button-coordinate",
    PrevMouseRightButtonCoordinate: "prev-mouse-right-button-coordinate",
    PrevMouseMiddleButtonCoordinate: "prev-mouse-middle-button-coordinate",
    ConnectionCreateIgnore: "connection-create-ignore", // undo-helper
    ConnectionDeleteIgnore: "connection-delete-ignore", // undo-helper
    CurrentGraphSaveName: "current-graph-save-name", // graph-save-helper

    // local, only string->string
    GraphKeys: "pmos-graph-keys", // graph-save-helper, string: [key0, ...]
    // Graph: "pmos-graph-*" // graph-save-helper, string: {timestamp:int,createTimestamp:int,data:JsonStr,name:str}
    ThemeSetting: "theme-setting", // theme-helper
};

function MEMORY_GET(key, default_value) {
    const ret = SHARE_MEMORY.get(key);
    return ret == undefined ? default_value : ret;
}

function MEMORY_SET(key, value) {
    SHARE_MEMORY.set(key, value);
}

function SAVE_TO_LOCAL(key, value) {
    window.localStorage.setItem(key, value);
}

function READ_FROM_LOCAL(key, default_value) {
    const ret = window.localStorage.getItem(key);
    return ret == undefined ? default_value : ret;
}

function DELETE_FROM_LOCAL(key) {
    window.localStorage.removeItem(key);
}
