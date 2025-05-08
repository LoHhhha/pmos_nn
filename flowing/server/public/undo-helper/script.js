/**
 * MESSAGE_TYPE.OperationSave
 * !! call before changing if changed, and using MESSAGE_CALL !!
 *      <event.detail.deleteConnections: Iter[{src:Node,srcEndpointIdx:int,tar:Node,tarEndpointIdx:int}]>
 *      <event.detail.createConnections: Iter[{src:Node,srcEndpointIdx:int,tar:Node,tarEndpointIdx:int}]>
 *      <event.detail.deleteNodes: Iter[Node]>
 *      <event.detail.createNodes: Iter[Node]>
 *      <event.detail.moveNodes: Iter[{node:Node,prevX,prevY,curX,curY}]>
 *
 * MESSAGE_TYPE.OperationUndo
 *
 * MESSAGE_TYPE.OperationRecordReset
 */

const UNDO_OPERATION_STACK = new Array(); // Slices
const UNDO_ICON = ICONS.undo;

class Slice {
    isEmpty = true;

    deleteConnections; // Array[{srcId:Node.id,srcEndpointIdx:int,tarId:Node.id,tarEndpointIdx:int}]
    createConnections; // Array[{srcId:Node.id,srcEndpointIdx:int,tarId:Node.id,tarEndpointIdx:int}]
    deleteNodes; // Array[{id:Node.id,apiName,content,left,top}]
    createNodes; // Array[{id:Node.id}]
    movedNodes; // Array[{id:Node.id,prevX,prevY,curX,curY}]

    static jsPlumbInstance;
    static getNodeById(id) {
        return MEMORY_GET(MEMORY_KEYS.Id2Node)?.get(id);
    }

    recover() {
        // step1. create deleteNodes
        // using the prev id, this id will always reserved
        MESSAGE_CALL(MESSAGE_TYPE.CreateNodes, {
            nodesInfo: this.deleteNodes,
            connectionsInfo: [],
            undoHelperCall: true,
            viewportCoordinate: true,
        });

        // step2. create deleteConnections
        for (const { srcId, srcEndpointIdx, tarId, tarEndpointIdx } of this
            .deleteConnections) {
            const src = Slice.getNodeById(srcId);
            const tar = Slice.getNodeById(tarId);

            // impossible
            if (src === undefined || tar === undefined) {
                console.error(`[OperationUndo] node not found `, {
                    srcId,
                    tarId,
                    src,
                    tar,
                });
                continue;
            }
            if (
                srcEndpointIdx < 0 ||
                src.outputEndpoint.length <= srcEndpointIdx ||
                tarEndpointIdx < 0 ||
                tar.inputEndpoint.length <= tarEndpointIdx
            ) {
                console.error(`[OperationUndo] found unexpected idx as`, {
                    srcEndpointIdx,
                    tarEndpointIdx,
                });
                continue;
            }

            const connectionKey = getConnectionKey(
                srcId,
                srcEndpointIdx,
                tarId,
                tarEndpointIdx
            );
            MEMORY_GET(MEMORY_KEYS.ConnectionCreateIgnore).add(connectionKey);

            Slice.jsPlumbInstance.connect({
                source: src.outputEndpoint[srcEndpointIdx],
                target: tar.inputEndpoint[tarEndpointIdx],
            });
        }

        // step3. delete createConnections
        for (const { srcId, srcEndpointIdx, tarId, tarEndpointIdx } of this
            .createConnections) {
            const src = Slice.getNodeById(srcId);

            // impossible
            if (src === undefined) {
                console.error(`[OperationUndo] node not found `, {
                    srcId,
                    src,
                });
                continue;
            }

            const connectionKey = getConnectionKey(
                srcId,
                srcEndpointIdx,
                tarId,
                tarEndpointIdx
            );
            MEMORY_GET(MEMORY_KEYS.ConnectionDeleteIgnore).add(connectionKey);

            const connection = src.connections.get(connectionKey)?.connection;
            // impossible
            if (connection === undefined) {
                console.error(`[OperationUndo] connection not found `, {
                    connectKey: getConnectionKey(
                        srcId,
                        srcEndpointIdx,
                        tarId,
                        tarEndpointIdx
                    ),
                });
                continue;
            }

            Slice.jsPlumbInstance.deleteConnection(connection);
        }

        // step4. delete createNodes
        const needDeleteNodes = this.createNodes.map((item) => {
            return Slice.getNodeById(item.id);
        });
        MESSAGE_CALL(MESSAGE_TYPE.DeleteNodes, {
            nodes: needDeleteNodes,
            undoHelperCall: true,
            quiet: true,
        });

        // step5. recover movement
        for (const { id, prevX, prevY } of this.movedNodes) {
            const node = Slice.getNodeById(id);
            if (node === undefined) {
                console.warn(
                    `[OperationUndo] detect an unexpected node.id as ${id} in movedNodes`
                );
                continue;
            }
            node.redraw(prevX, prevY);
        }

        // step6. end
        MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
            config: PROMPT_CONFIG.INFO,
            iconSvg: UNDO_ICON,
            content: `Changed ${
                needDeleteNodes.length +
                this.deleteNodes.length +
                this.movedNodes.length
            } node(s) and ${
                this.createConnections.length + this.deleteConnections.length
            } connection(s).`,
            timeout: 2000,
        });
        console.info(
            `[OperationUndo] Deleted ${needDeleteNodes.length} node(s) and ${this.createConnections.length} connection(s), created ${this.deleteNodes.length} node(s) and ${this.deleteConnections.length} connection(s)`,
            {
                deleteConnections: this.deleteConnections,
                createConnections: this.createConnections,
                deleteNodes: this.deleteNodes,
                createNodes: this.createNodes,
                movedNodes: this.movedNodes,
            }
        );
    }

    constructor(
        deleteConnections, // Iter[{src:Node,srcEndpointIdx:int,tar:Node,tarEndpointIdx:int}]>
        createConnections, // Iter[{src:Node,srcEndpointIdx:int,tar:Node,tarEndpointIdx:int}]>
        deleteNodes, // Iter[Node]
        createNodes, // Iter[Node]
        moveNodes // Iter[{node:Node,prevX,prevY,curX,curY}]>
    ) {
        this.deleteConnections = [];
        if (deleteConnections) {
            for (const {
                src,
                srcEndpointIdx,
                tar,
                tarEndpointIdx,
            } of deleteConnections) {
                this.deleteConnections.push({
                    srcId: src.id,
                    srcEndpointIdx: srcEndpointIdx,
                    tarId: tar.id,
                    tarEndpointIdx: tarEndpointIdx,
                });
                this.isEmpty = false;
            }
        }

        this.createConnections = [];
        if (createConnections) {
            for (const {
                src,
                srcEndpointIdx,
                tar,
                tarEndpointIdx,
            } of createConnections) {
                this.createConnections.push({
                    srcId: src.id,
                    srcEndpointIdx: srcEndpointIdx,
                    tarId: tar.id,
                    tarEndpointIdx: tarEndpointIdx,
                });
                this.isEmpty = false;
            }
        }

        this.deleteNodes = [];
        if (deleteNodes) {
            for (const node of deleteNodes) {
                const { left, top } = node.getCoordinates();
                this.deleteNodes.push({
                    id: node.id,
                    apiName: node.config.apiName,
                    content: JSON.parse(JSON.stringify(node.content)),
                    left: left,
                    top: top,
                });
                this.isEmpty = false;
            }
        }

        this.createNodes = [];
        if (createNodes) {
            for (const node of createNodes) {
                this.createNodes.push({
                    id: node.id,
                });
                this.isEmpty = false;
            }
        }

        this.movedNodes = [];
        if (moveNodes) {
            for (const { node, prevX, prevY, curX, curY } of moveNodes) {
                if (prevX === curX && prevY === curY) continue;
                this.movedNodes.push({
                    id: node.id,
                    prevX,
                    prevY,
                    curX,
                    curY,
                });
                this.isEmpty = false;
            }
        }
    }
}

(function () {
    const undoClear = () => {
        MEMORY_SET(MEMORY_KEYS.CanUndoOperation, false);
        UNDO_OPERATION_STACK.length = 0;
    };
    undoClear();

    window.addUndoHelper = (jsPlumbInstance) => {
        // init ignores
        MEMORY_SET(MEMORY_KEYS.ConnectionCreateIgnore, new Set()); // connectionKey
        MEMORY_SET(MEMORY_KEYS.ConnectionDeleteIgnore, new Set()); // connectionKey

        Slice.jsPlumbInstance = jsPlumbInstance;

        MESSAGE_HANDLER(MESSAGE_TYPE.OperationSave, (event) => {
            const slice = new Slice(
                event.detail?.deleteConnections,
                event.detail?.createConnections,
                event.detail?.deleteNodes,
                event.detail?.createNodes,
                event.detail?.moveNodes
            );
            if (slice.isEmpty) {
                console.warn("[OperationSave] not info found!", event);
                return;
            }
            UNDO_OPERATION_STACK.push(slice);
            MEMORY_SET(MEMORY_KEYS.CanUndoOperation, true);
            MESSAGE_PUSH(MESSAGE_TYPE.GraphChanged);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.OperationUndo, (event) => {
            if (UNDO_OPERATION_STACK.length === 0) {
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.WARNING,
                    iconSvg: UNDO_ICON,
                    content: `Can not undo now!`,
                    timeout: 2000,
                });
                console.warn("[OperationUndo] can not undo now!", event);
                return;
            }

            const slice = UNDO_OPERATION_STACK.pop();
            slice.recover();

            if (UNDO_OPERATION_STACK.length === 0) {
                undoClear();
            }

            MESSAGE_PUSH(MESSAGE_TYPE.GraphChanged);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.OperationRecordReset, () => {
            undoClear();
        });

        jsPlumbInstance.bind("drag:stop", (dragStopPayload) => {
            MESSAGE_PUSH(MESSAGE_TYPE.OperationSave, {
                moveNodes: dragStopPayload.elements.map((item) => {
                    return {
                        node: item.el.origin,
                        prevX: item.originalPos.x,
                        prevY: item.originalPos.y,
                        curX: item.pos.x,
                        curY: item.pos.y,
                    };
                }),
            });
        });

        window.addUndoHelper = () => {
            console.warn("Do not create UndoHelper more than once!");
        };
    };
})();
