(function () {
    window.createJsPlumbInstance = (container) => {
        const instance = jsPlumb.newInstance({ container: container });

        // beforeDrop: operator-bar
        // connection: graph
        // connection:detach: graph

        return instance;
    };
})();
