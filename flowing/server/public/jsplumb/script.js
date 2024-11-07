(function () {
    window.createJsPlumbInstance = (container) => {
        const instance = jsPlumb.newInstance({
            container: container,
            paintStyle: {
                stroke: "var(--jsplumb-connection-color)",
            },
            endpointStyle: { fill: "var(--jsplumb-endpoint-color)" },
        });

        // beforeDrop: operator-bar
        // connection: graph
        // connection:detach: graph

        return instance;
    };
})();
