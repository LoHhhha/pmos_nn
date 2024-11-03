const MESSAGE_BUS = document.createElement("div");

const MESSAGE_TYPE = {
    CalculateGraph: "calculate-graph",
    ClearNode: "clear-node",

    CoveringShowCustom: "covering-show-custom",
    CoveringClose: "covering-close",

    RightKeyMenuShow: "right-key-menu-show",
    RightKeyMenuClose: "right-key-menu-close",
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
