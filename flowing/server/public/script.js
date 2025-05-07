jsPlumb.ready(() => {
    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
        config: PROMPT_CONFIG.INFO,
        content: "Welcome to PMoS, click me to know more about PMoS!",
        onclick: (promptItem) => {
            window.open(PMoS_REP_HREF);
            promptItem.dispose();
        },
    });

    // set copyright
    const copyrightEle = document.getElementById("copyright");
    copyrightEle.innerHTML = `Powered by PMoS-nn<br>Version: ${PMoS_VERSION}<br>Copyright © 2024-2025 PMoS. All rights reserved.`;

    // initTheme set as null, set as local settings or 'auto'.
    window.addThemeHelper(null);

    const viewportEle = document.getElementById("viewport");
    const canvasEle = document.getElementById("canvas");

    // record the mouse button coordinate
    window.document.addEventListener("mouseup", (event) => {
        const memKey =
            event.button === 0
                ? MEMORY_KEYS.PrevMouseLeftButtonCoordinate
                : event.button === 1
                ? MEMORY_KEYS.PrevMouseMiddleButtonCoordinate
                : MEMORY_KEYS.PrevMouseRightButtonCoordinate;
        MEMORY_SET(memKey, {
            left: event.clientX,
            top: event.clientY,
        });
    });
    // disable default contextmenu
    window.document.oncontextmenu = () => false;

    window.addChecksBackgroundTo(viewportEle);

    const jsPlumbInstance = window.createJsPlumbInstance(canvasEle);

    const jsPlumbNavigator = window.createJsPlumbNavigator(
        jsPlumbInstance,
        viewportEle
    );

    window.createOperatorBar(jsPlumbNavigator);

    window.createMiniMap(jsPlumbNavigator, viewportEle, canvasEle);

    window.createJsPlumbConnectionListener(jsPlumbInstance);

    window.createGraphListener(jsPlumbNavigator);

    window.addNodesCopyHelper(jsPlumbNavigator);

    window.addPortHelper();

    window.addLLMCodeGenerator();

    window.addUndoHelper(jsPlumbInstance);

    window.addGraphSaveHelper();

    // welcome page
    MESSAGE_PUSH(MESSAGE_TYPE.ShowSaveGraphs);
});
