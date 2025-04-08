/**
 * MESSAGE_TYPE.SaveGraph
 *      this will change or use CURRENT_GRAPH_KEY
 *      [<event.detail.name:str>]
 *      [<event.detail.asNew:bool>]
 *
 * MESSAGE_TYPE.GraphSaved (out)
 *      <event.detail.timestamp>
 *      <event.detail.name>
 *
 * MESSAGE_TYPE.ShowSaveGraphs
 *      [<event.detail.closeText>]
 */

const GRAPH_SAVE_HELPER_ICON = ICONS.save;
const GRAPH_SAVE_HELPER_DEFAULT_GRAPH_NAME = "UNNAMED";
let CURRENT_GRAPH_KEY = undefined;

const GRAPH_SAVE_HELPER_FRAME_QUEUE_WEIGHT = CALL_QUEUE_AMOUNT - 1;

(function () {
    window.addGraphSaveHelper = () => {
        MESSAGE_HANDLER(MESSAGE_TYPE.SaveGraph, (event) => {
            const callResult = MESSAGE_CALL(MESSAGE_TYPE.ExportGraph, {
                containCoordinate: true,
                quiet: true,
            });
            if (callResult.length === 0) {
                console.error("[SaveGraph] ExportGraph handler not found!");
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.ERROR,
                    iconSvg: GRAPH_SAVE_HELPER_ICON,
                    content:
                        "ExportGraph handler not found, please contact us!",
                    timeout: 5000,
                });
                return;
            }

            const timestamp = new Date().getTime();
            let graphInfo;
            if (event.detail?.name) {
                graphInfo = {
                    name: event.detail?.name,
                    data: callResult[0],
                    timestamp: timestamp,
                };
            } else {
                graphInfo = {
                    name: MEMORY_GET(
                        MEMORY_KEYS.CurrentGraphSaveName,
                        GRAPH_SAVE_HELPER_DEFAULT_GRAPH_NAME
                    ),
                    data: callResult[0],
                    timestamp: timestamp,
                };
            }

            const memoryGraphInfo = GraphSaveUtils.getGraph(CURRENT_GRAPH_KEY);

            if (
                event.detail?.asNew ||
                CURRENT_GRAPH_KEY === undefined ||
                memoryGraphInfo === undefined
            ) {
                // as a new graph, change current graphKey
                CURRENT_GRAPH_KEY = GraphSaveUtils.addGraph({
                    ...graphInfo,
                    createTimestamp: timestamp,
                });
            } else {
                GraphSaveUtils.updateGraph(CURRENT_GRAPH_KEY, graphInfo);
            }

            graphInfo = GraphSaveUtils.getGraph(CURRENT_GRAPH_KEY);

            if (graphInfo === undefined) {
                MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                    config: PROMPT_CONFIG.ERROR,
                    iconSvg: GRAPH_SAVE_HELPER_ICON,
                    content: "Graph save error, please contact us!",
                    timeout: 5000,
                });
                console.error("[SaveGraph] graph not found after saved");
                return;
            }

            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: GRAPH_SAVE_HELPER_ICON,
                content: "Graph has been saved!",
                timeout: 2000,
            });

            MEMORY_SET(MEMORY_KEYS.CurrentGraphSaveName, graphInfo.name);

            MESSAGE_PUSH(MESSAGE_TYPE.GraphSaved, {
                timestamp: graphInfo.timestamp,
                name: graphInfo.name,
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ShowSaveGraphs, () => {
            const localGraphs = GraphSaveUtils.getGraphs();
            localGraphs.sort((a, b) => {
                return a.graphInfo.timestamp < b.graphInfo.timestamp ? 1 : -1;
            });

            const directlyOpenEle = document.createElement("div");
            directlyOpenEle.className = "graph-save-directly-open";
            const directlyOpenTextEle = document.createElement("div");
            directlyOpenTextEle.className = "graph-save-directly-open-text";
            directlyOpenTextEle.textContent =
                event.detail?.closeText ||
                "Start the journey at PMoS from scratch";
            const directlyOpenIconEle = document.createElement("div");
            directlyOpenIconEle.className = "graph-save-directly-open-icon";
            directlyOpenIconEle.innerHTML = ICONS.right;
            directlyOpenEle.appendChild(directlyOpenTextEle);
            directlyOpenEle.appendChild(directlyOpenIconEle);
            directlyOpenEle.onclick = () => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
            };

            const prevGraphItemTitleEle = document.createElement("h2");
            prevGraphItemTitleEle.className = "graph-save-h2-title";
            prevGraphItemTitleEle.textContent = "Previous Graphs";

            const getTimeEle = (title, timestamp, cssClass) => {
                const timeEle = document.createElement("div");
                timeEle.classList.add(cssClass);
                timeEle.classList.add("graph-save-combo-template");
                const timeTitleEle = document.createElement("div");
                timeTitleEle.textContent = title;
                const timeTextEle = document.createElement("div");
                timeTextEle.textContent = new Date(timestamp).toLocaleString();
                timeTextEle.style.flex = 2;
                timeTextEle.style.textAlign = "right";
                timeEle.appendChild(timeTitleEle);
                timeEle.appendChild(timeTextEle);
                return timeEle;
            };
            const deleteIconClick = (graphKey, item, callback, event) => {
                GraphSaveUtils.deleteGraph(graphKey);
                item.remove();
                CALL_BEFORE_NEXT_FRAME(
                    GRAPH_SAVE_HELPER_FRAME_QUEUE_WEIGHT,
                    callback
                );

                event.stopPropagation();
            };
            const itemClick = (graphKey, graphInfo, event) => {
                MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose, {
                    afterClose: () => {
                        MESSAGE_CALL(MESSAGE_TYPE.ImportGraph, {
                            default: graphInfo.data,
                            withoutConfirm: true,
                            callback: () => {
                                MESSAGE_PUSH(MESSAGE_TYPE.OperationRecordReset);
                            },
                        });
                    },
                });
                MESSAGE_PUSH(MESSAGE_TYPE.GraphSaved, {
                    timestamp: graphInfo.timestamp,
                    name: graphInfo.name,
                });

                CURRENT_GRAPH_KEY = graphKey;
                MEMORY_SET(MEMORY_KEYS.CurrentGraphSaveName, graphInfo.name);

                event.stopPropagation();
            };

            const localGraphItemContainer = document.createElement("div");
            localGraphItemContainer.className = "graph-save-container";

            const checkLocalGraphItemContainer = () => {
                if (localGraphItemContainer.children.length === 0) {
                    localGraphItemContainer.textContent = "None";
                }
            };

            for (const { graphInfo, graphKey } of localGraphs) {
                const { name, data, timestamp, createTimestamp } = graphInfo;

                let graph;
                try {
                    graph = JSON.parse(data);
                } catch (err) {
                    console.error("[ShowSaveGraphs] detect an unexpect data", {
                        data,
                        err,
                    });
                    continue;
                }

                const item = document.createElement("div");
                item.classList.add("graph-save-item");

                const titleEle = document.createElement("div");
                titleEle.className = "graph-save-item-title";
                titleEle.textContent = name || "UNNAMED";

                const detailEle = document.createElement("div");
                detailEle.classList.add("graph-save-item-detail");
                detailEle.textContent = `${graph.nodes?.length || 0} node(s), ${
                    graph.connections?.length || 0
                } connection(s)`;

                const createTimeEle = getTimeEle(
                    "Created",
                    createTimestamp,
                    "graph-save-item-create-time"
                );
                const changeTimeEle = getTimeEle(
                    "Modify",
                    timestamp,
                    "graph-save-item-change-time"
                );

                const deleteIconEle = document.createElement("div");
                deleteIconEle.className = "graph-save-item-delete-icon";
                deleteIconEle.innerHTML = ICONS.cross;
                deleteIconEle.onclick = deleteIconClick.bind(
                    null,
                    graphKey,
                    item,
                    checkLocalGraphItemContainer
                );

                item.onclick = itemClick.bind(null, graphKey, graphInfo);

                item.appendChild(titleEle);
                item.appendChild(detailEle);
                item.appendChild(createTimeEle);
                item.appendChild(changeTimeEle);
                item.appendChild(deleteIconEle);

                localGraphItemContainer.appendChild(item);
            }

            checkLocalGraphItemContainer();

            // todo: online graphs

            const helpTitleEle = document.createElement("h2");
            helpTitleEle.className = "graph-save-h2-title";
            helpTitleEle.textContent = "Help";

            const introductionLinkEle = document.createElement("a");
            introductionLinkEle.textContent = "Instruction";
            introductionLinkEle.href = PMoS_FLOWING_INSTRUCTION_HREF;
            introductionLinkEle.target = "_blank";

            const repositoryLinkEle = document.createElement("a");
            repositoryLinkEle.textContent = "PMoS-nn Code Repository";
            repositoryLinkEle.href = PMoS_REP_HREF;
            repositoryLinkEle.target = "_blank";

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                title: "What's next?",
                elements: [
                    directlyOpenEle,
                    prevGraphItemTitleEle,
                    localGraphItemContainer,
                    helpTitleEle,
                    introductionLinkEle,
                    repositoryLinkEle,
                ],
            });
        });

        ADD_KEY_HANDLER(
            DEFAULT_KEY_NAMESPACE,
            "s",
            [MODIFIER_KEY_CODE.ctrl],
            () => {
                MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph);
            }
        );
    };
})();
