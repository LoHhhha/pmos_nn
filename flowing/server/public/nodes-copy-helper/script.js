/**
 * MESSAGE_TYPE.NodesCopy
 *      <event.detail.nodes: Array<Node>|Set<Node> -> NODES_COPY_DATA
 *
 * MESSAGE_TYPE.NodesPaste
 *      <event.detail.left> <event.detail.top> -> MESSAGE_TYPE.CreateNode
 *
 */

let NODES_COPY_DATA = new Array(0);
let CONNECTION_COPY_DATA = new Array(0); // todo

(function () {
    window.addNodesCopyHelper = (jsPlumbNavigator) => {
        MEMORY_SET(MEMORY_KEYS.CanPasteNodes, false);

        MESSAGE_HANDLER(MESSAGE_TYPE.NodesCopy, (event) => {
            const nodes = event.detail?.nodes;
            const len = nodes.length !== undefined ? nodes.length : nodes.size;
            if (
                nodes[Symbol.iterator] === undefined ||
                len === undefined ||
                len === 0
            ) {
                console.warn(
                    "[NodesCopyHelper-NodesCopy] get an unexpected nodes as",
                    nodes
                );
                MEMORY_SET(MEMORY_KEYS.CanPasteNodes, false);
                return;
            }

            let midLeft = 0,
                midTop = 0;
            for (const node of nodes) {
                midLeft += node.element.offsetLeft;
                midTop += node.element.offsetTop;
            }
            midLeft /= len;
            midTop /= len;

            NODES_COPY_DATA.length = 0;
            for (const node of nodes) {
                const content = {};
                for (const arg of node.config.args) {
                    content[arg.name] = node.content[arg.name];
                }
                NODES_COPY_DATA.push({
                    left: node.element.offsetLeft - midLeft,
                    top: node.element.offsetTop - midTop,
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
            const scale = jsPlumbNavigator.getCanvasScale();
            MESSAGE_PUSH(MESSAGE_TYPE.CreateNode, {
                nodesInfo: NODES_COPY_DATA,
                connectionsInfo: CONNECTION_COPY_DATA,
                offsetLeft: event.detail.left / scale,
                offsetTop: event.detail.top / scale,
            });

            console.log(
                `[NodesCopyHelper-NodesPaste] paste ${NODES_COPY_DATA.length} node`
            );
        });
    };
})();
