/**
 * MESSAGE_TYPE.NodesCopy
 *      <event.detail.nodes: Array<Node>|Set<Node> -> NODES_COPY_DATA
 *
 * MESSAGE_TYPE.NodesPaste
 *      (window left, top)
 *      <event.detail.left> <event.detail.top> -> MESSAGE_TYPE.CreateNode
 *
 */

const NODES_COPY_DATA = new Array(0);
const NODES_COPY_POSITION = {
    left: 0,
    top: 0,
};
const CONNECTION_COPY_DATA = new Array(0);

const NO_OFFSET_PASTE_EXCURSION = {
    left: 50,
    top: 50,
};

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

            NODES_COPY_POSITION.left = midLeft;
            NODES_COPY_POSITION.top = midTop;

            NODES_COPY_DATA.length = len;
            let id2idx = new Map();
            let idx = 0; // nodes: Array or Set
            for (const node of nodes) {
                const content = {};
                for (const arg of node.config.args) {
                    content[arg.name] = node.content[arg.name];
                }
                NODES_COPY_DATA[idx] = {
                    left: node.element.offsetLeft - midLeft,
                    top: node.element.offsetTop - midTop,
                    config: node.config,
                    content: content,
                };
                id2idx.set(node.id, idx);

                idx++;
            }

            CONNECTION_COPY_DATA.length = 0;
            idx = 0; // nodes: Array or Set
            for (const node of nodes) {
                for (const [eIdx, point] of node.inputEndpointPrev.entries()) {
                    if (point === null) continue;
                    const fromNodeId = point.nodeId,
                        fromNodeEndpointIdx = point.endpointIdx;
                    const fromNodeIdx = id2idx.get(fromNodeId);
                    if (fromNodeIdx === undefined) continue;

                    CONNECTION_COPY_DATA.push({
                        srcNodeIdx: fromNodeIdx,
                        srcEndpointIdx: fromNodeEndpointIdx,
                        tarNodeIdx: idx,
                        tarEndpointIdx: eIdx,
                    });
                }

                idx++;
            }

            MEMORY_SET(MEMORY_KEYS.CanPasteNodes, true);
            console.info(
                `[NodesCopyHelper-NodesCopy] copy ${NODES_COPY_DATA.length} node(s) and ${CONNECTION_COPY_DATA.length} edge(s).`
            );
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: ICONS.copy,
                content: `Copy ${NODES_COPY_DATA.length} node(s) and ${CONNECTION_COPY_DATA.length} edge(s)`,
                timeout: 1000,
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.NodesPaste, (event) => {
            const navigatorInfo = jsPlumbNavigator.getCanvasBoundsAndScale();

            let offsetLeft = event.detail?.left,
                offsetTop = event.detail?.top;
            if (offsetLeft === undefined || offsetTop === undefined) {
                // element left,top -> window left,top
                offsetLeft =
                    NODES_COPY_POSITION.left +
                    navigatorInfo.left +
                    NO_OFFSET_PASTE_EXCURSION.left;
                offsetTop =
                    NODES_COPY_POSITION.top +
                    navigatorInfo.top +
                    NO_OFFSET_PASTE_EXCURSION.top;
            } else {
                // window left,top
                offsetLeft /= navigatorInfo.scale;
                offsetTop /= navigatorInfo.scale;
            }

            MESSAGE_PUSH(MESSAGE_TYPE.CreateNodes, {
                nodesInfo: NODES_COPY_DATA,
                connectionsInfo: CONNECTION_COPY_DATA,
                offsetLeft: offsetLeft,
                offsetTop: offsetTop,
            });

            console.info(
                `[NodesCopyHelper-NodesPaste] paste ${NODES_COPY_DATA.length} node(s) and ${CONNECTION_COPY_DATA.length} edge(s).`
            );
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: ICONS.paste,
                content: `Pasted ${NODES_COPY_DATA.length} node(s) and ${CONNECTION_COPY_DATA.length} edge(s)`,
                timeout: 1000,
            });
        });
    };
})();
