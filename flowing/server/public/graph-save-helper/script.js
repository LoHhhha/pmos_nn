/**
 * MESSAGE_TYPE.SaveGraph
 *      this will change or use CURRENT_GRAPH_KEY
 *      [<event.detail.name:str>]
 *      [<event.detail.asNew:bool>]
 *
 * MESSAGE_TYPE.GraphSaved (out)
 *      [<event.detail.timestamp>]
 *      <event.detail.name>
 *
 * MESSAGE_TYPE.OpenGraphs
 *      [<event.detail.continueText>]
 *      [<event.detail.continueDisabled>]
 *      [<event.detail.newGraphText>]
 *      [<event.detail.newGraphDisabled>]
 */

const GRAPH_SAVE_HELPER_ICON = ICONS.save;
let CURRENT_GRAPH_KEY;

const GRAPH_SAVE_HELPER_FRAME_QUEUE_WEIGHT = CALL_QUEUE_AMOUNT - 1;

(function () {
    const addTransverseItem = (
        text,
        defaultText,
        callback,
        transverseItems
    ) => {
        const ele = document.createElement("div");
        ele.className = "graph-save-transverse-item";
        const textEle = document.createElement("div");
        textEle.className = "graph-save-transverse-item-text";
        textEle.textContent = text || defaultText;
        const iconEle = document.createElement("div");
        iconEle.className = "graph-save-transverse-item-icon";
        iconEle.innerHTML = ICONS.right;
        ele.appendChild(textEle);
        ele.appendChild(iconEle);
        ele.onclick = callback;

        if (transverseItems.length) {
            ele.classList.add("graph-save-transverse-item-tail");
        }

        transverseItems.push(ele);
    };

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
                        I18N_STRINGS.handler_not_found_format?.format(
                            "ExportGraph"
                        ),
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
                        I18N_STRINGS.unnamed_graph
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
                    content: I18N_STRINGS.graph_save_error,
                    timeout: 5000,
                });
                console.error("[SaveGraph] graph not found after saved");
                return;
            }

            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: GRAPH_SAVE_HELPER_ICON,
                content: I18N_STRINGS.graph_saved,
                timeout: 2000,
            });

            MEMORY_SET(MEMORY_KEYS.CurrentGraphSaveName, graphInfo.name);

            MESSAGE_PUSH(MESSAGE_TYPE.GraphSaved, {
                timestamp: graphInfo.timestamp,
                name: graphInfo.name,
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.OpenGraphs, (event) => {
            const localGraphs = GraphSaveUtils.getGraphs();
            localGraphs.sort((a, b) => {
                return a.graphInfo.timestamp < b.graphInfo.timestamp ? 1 : -1;
            });

            const transverseItems = [];

            if (!event.detail?.continueDisabled) {
                addTransverseItem(
                    event.detail?.continueText,
                    I18N_STRINGS.continue_graph_format?.format(
                        MEMORY_GET(
                            MEMORY_KEYS.CurrentGraphSaveName,
                            I18N_STRINGS.unnamed_graph
                        )
                    ),
                    () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                    },
                    transverseItems
                );
            }
            if (!event.detail?.newGraphDisabled) {
                addTransverseItem(
                    event.detail?.newGraphText,
                    I18N_STRINGS.create_graph,
                    () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose, {
                            afterClose: () => {
                                MESSAGE_PUSH(MESSAGE_TYPE.RestartPage, {
                                    title: I18N_STRINGS.create_graph,
                                });
                            },
                        });
                    },
                    transverseItems
                );
            }

            const prevGraphItemTitleEle = document.createElement("h2");
            prevGraphItemTitleEle.className = "graph-save-h2-title";
            prevGraphItemTitleEle.textContent = I18N_STRINGS.previous_graphs;

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
                                MESSAGE_PUSH(MESSAGE_TYPE.GraphSaved, {
                                    timestamp: graphInfo.timestamp,
                                    name: graphInfo.name,
                                });
                            },
                        });
                        CURRENT_GRAPH_KEY = graphKey;
                    },
                });

                event.stopPropagation();
            };

            const localGraphItemContainer = document.createElement("div");
            localGraphItemContainer.className = "graph-save-container";

            const checkLocalGraphItemContainer = () => {
                if (localGraphItemContainer.children.length === 0) {
                    localGraphItemContainer.textContent = I18N_STRINGS.none;
                }
            };

            for (const { graphInfo, graphKey } of localGraphs) {
                const { name, data, timestamp, createTimestamp } = graphInfo;

                let graph;
                try {
                    graph = JSON.parse(data);
                } catch (err) {
                    console.error("[OpenGraphs] detect an unexpect data", {
                        data,
                        err,
                    });
                    continue;
                }

                if (graphKey === CURRENT_GRAPH_KEY) {
                    continue;
                }

                const item = document.createElement("div");
                item.classList.add("graph-save-item");

                const titleEle = document.createElement("div");
                titleEle.className = "graph-save-item-title";
                titleEle.textContent = name || I18N_STRINGS.unnamed_graph;

                const detailEle = document.createElement("div");
                detailEle.classList.add("graph-save-item-detail");
                detailEle.textContent = `${graph.nodes?.length || 0} ${
                    I18N_STRINGS.nodes
                }${I18N_STRINGS.sep}${graph.connections?.length || 0} ${
                    I18N_STRINGS.connections
                }`;

                const createTimeEle = getTimeEle(
                    I18N_STRINGS.created_time,
                    createTimestamp,
                    "graph-save-item-create-time"
                );
                const changeTimeEle = getTimeEle(
                    I18N_STRINGS.modify_time,
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
            helpTitleEle.textContent = I18N_STRINGS.help;

            const introductionLinkEle = document.createElement("a");
            introductionLinkEle.textContent = I18N_STRINGS.instruction;
            introductionLinkEle.href = PMoS_FLOWING_INSTRUCTION_HREF;
            introductionLinkEle.target = "_blank";

            const repositoryLinkEle = document.createElement("a");
            repositoryLinkEle.textContent = `PMoS-nn ${I18N_STRINGS.code_repository}`;
            repositoryLinkEle.href = PMoS_REP_HREF;
            repositoryLinkEle.target = "_blank";

            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                title: I18N_STRINGS.whats_next,
                elements: [
                    ...transverseItems,
                    prevGraphItemTitleEle,
                    localGraphItemContainer,
                    helpTitleEle,
                    introductionLinkEle,
                    repositoryLinkEle,
                ],
            });
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ResetCurrentSaveGraph, () => {
            // reset graph key
            CURRENT_GRAPH_KEY = undefined;
            // reset graph name
            MESSAGE_CALL(MESSAGE_TYPE.GraphSaved, {
                timestamp: undefined,
                name: I18N_STRINGS.unnamed_graph,
            });
            // unsaved
            MESSAGE_CALL(MESSAGE_TYPE.GraphChanged);
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
