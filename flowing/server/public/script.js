jsPlumb.ready(() => {
    MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
        config: PROMPT_CONFIG.INFO,
        content: "Welcome to PMoS, click me to know more about PMoS!",
        onclick: (promptItem) => {
            window.open(PMoS_REP_HREF);
            promptItem.dispose();
        },
    });

    // initTheme set as null, because minimapBar will set.
    window.addThemeHelper(null);

    const viewportEle = document.getElementById("viewport");
    const canvasEle = document.getElementById("canvas");

    window.addChecksBackgroundTo(viewportEle);

    const jsPlumbInstance = window.createJsPlumbInstance(canvasEle);

    const jsPlumbNavigator = window.createJsPlumbNavigator(
        jsPlumbInstance,
        viewportEle
    );

    // todo 添加标签显示功能
    const operatorBar = window.createOperatorBar(jsPlumbNavigator);

    const minimapBar = window.createMainBar(
        jsPlumbNavigator,
        viewportEle,
        canvasEle
    );

    window.createJsPlumbConnectionListener(jsPlumbInstance);

    window.createGraphListener(jsPlumbNavigator);

    window.addNodesCopyHelper(jsPlumbNavigator);

    window.addPortHelper();

    window.addLLMCodeGenerator();
});
