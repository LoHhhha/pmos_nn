const SHARE_MEMORY = new Map();

const MEMORY_KEYS = {
    CanPasteNodes: "can-paste-nodes",
};

function MEMORY_GET(key, default_value) {
    const ret = SHARE_MEMORY.get(key);
    return ret === undefined ? default_value : ret;
}

function MEMORY_SET(key, value) {
    SHARE_MEMORY.set(key, value);
}
