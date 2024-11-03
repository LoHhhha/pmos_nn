const PMoS_HREF = "https://github.com/LoHhhha/pmos_nn";

jsPlumb.ready(() => {
    const viewportEle = document.getElementById("viewport");
    const canvasEle = document.getElementById("canvas");

    window.addGriddingBackGroupTo(viewportEle);

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
        canvasEle,
    )

    window.createJsPlumbConnectionListener(jsPlumbInstance);
});
