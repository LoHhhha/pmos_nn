(function () {
    window.createJsPlumbInstance = (container) => {
        const instance = jsPlumb.newInstance({ container: container });

        return instance;
    };
})();
