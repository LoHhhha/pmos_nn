jsPlumb.ready(async () => {
    // initLanguage set as null, set as local settings or english.
    window.addI18n(null);

    // initTheme set as null, set as local settings or 'auto'.
    window.addThemeHelper(null);

    // get version for server
    try {
        await fetch("/hello", { method: "POST" })
            .then((response) => response.json())
            .then((data) => {
                PMoS_FLOWING_VERSION = data.package_version;
                PMoS_VERSION = data.web_version;
                BACKEND_TORCH_READY = data.torch_ready;
                BACKEND_MIND_SPORE_READY = data.mindspore_ready;
                BACKEND_TENSOR_FLOW_READY = data.tensorflow_ready;
            });
    } catch (error) {
        console.error("[HelloBackend]", { error });
        MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
            config: PROMPT_CONFIG.ERROR,
            iconSvg: ICONS.error,
            content: I18N_STRINGS.server_disconnect,
            timeout: 5000,
        });
    }

    // set copyright
    const copyrightEle = document.getElementById("copyright");
    copyrightEle.innerHTML = `Version: ${PMoS_VERSION}<br>Powered by PMoS-nn(${PMoS_FLOWING_VERSION})<br>Copyright © 2024-2025 PMoS. All rights reserved.`;

    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
        config: PROMPT_CONFIG.INFO,
        content: I18N_STRINGS.welcome,
        onclick: (promptItem) => {
            promptItem.dispose();
            MESSAGE_PUSH(MESSAGE_TYPE.HelpPage);
        },
    });

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

    window.initTopControlBar();

    // touch mode warning
    const touchDeleteCallback = () => {
        MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
            config: PROMPT_CONFIG.WARNING,
            content: I18N_STRINGS.feature_limited_when_touch,
            timeout: 10000,
        });
        document.removeEventListener("touchstart", touchDeleteCallback);
    };
    document.addEventListener("touchstart", touchDeleteCallback, false);

    // welcome page
    MESSAGE_PUSH(MESSAGE_TYPE.OpenGraphs, {
        continueText: I18N_STRINGS.using_from_scratch,
        newGraphDisabled: true,
    });
});
