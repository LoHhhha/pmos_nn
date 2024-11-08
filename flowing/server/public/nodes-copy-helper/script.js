/**
 * MESSAGE_TYPE.NodesCopy
 *      <event.detail.nodes: Array<Node>> -> NODES_COPY_DATA
 *
 * MESSAGE_TYPE.NodesPaste
 *      <event.detail.left> <event.detail.top> -> MESSAGE_TYPE.CreateNode
 *
 */

let NODES_COPY_DATA = Array(0);
let CONNECTION_COPY_DATA = Array(0); // todo

(function () {
    window.addNodesCopyHelper = (jsPlumbNavigator) => {
        MEMORY_SET(MEMORY_KEYS.CanPasteNodes, false);

        MESSAGE_HANDLER(MESSAGE_TYPE.NodesCopy, (event) => {
            const nodes = event.detail?.nodes;
            if (!(nodes instanceof Array)) {
                console.warn(
                    "[NodesCopyHelper-NodesCopy] get an unexpected nodes as",
                    nodes
                );
                return;
            }

            let minLeft = Number.MAX_SAFE_INTEGER,
                minTop = Number.MAX_SAFE_INTEGER;
            for (const node of nodes) {
                minLeft = Math.min(node.element.offsetLeft, minLeft);
                minTop = Math.min(node.element.offsetTop, minTop);
            }

            NODES_COPY_DATA.length = 0;
            for (const node of nodes) {
                const content = {};
                for (const arg of node.config.args) {
                    content[arg.name] = node.content[arg.name];
                }
                NODES_COPY_DATA.push({
                    left: node.element.offsetLeft - minLeft,
                    top: node.element.offsetTop - minTop,
                    config: node.config,
                    content: content,
                });
            }

            MEMORY_SET(MEMORY_KEYS.CanPasteNodes, true);
            console.log(
                `[NodesCopyHelper-NodesCopy] copy ${NODES_COPY_DATA.length} node`
            );
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NodesPaste, (event) => {
            if (
                event.detail?.left === undefined ||
                event.detail?.top === undefined
            ) {
                console.warn(
                    "[NodesCopyHelper-NodesPaste] get an unexpected nodes as",
                    nodes
                );
                return;
            }

            MESSAGE_PUSH(MESSAGE_TYPE.CreateNode, {
                nodesInfo: NODES_COPY_DATA,
                connectionsInfo: CONNECTION_COPY_DATA,
                offsetLeft: event.detail.left,
                offsetTop: event.detail.top,
            });

            console.log(
                `[NodesCopyHelper-NodesPaste] paste ${NODES_COPY_DATA.length} node`
            );
        });
    };
})();
