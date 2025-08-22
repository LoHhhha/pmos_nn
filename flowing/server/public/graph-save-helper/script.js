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
 *      [<event.detail.firstTime:bool>]
 *
 * MESSAGE_TYPE.FrameworkChanged (out)
 *      <event.detail.framework>
 *
 * MESSAGE_TYPE.ChangeFramework
 *      <event.detail.framework>
 */

const GRAPH_SAVE_HELPER_ICON = ICONS.save;
let CURRENT_GRAPH_KEY;

const GRAPH_SAVE_HELPER_FRAME_QUEUE_WEIGHT = CALL_QUEUE_AMOUNT - 1;

(function () {
    const addTransverseItem = (
        text,
        callback,
        transverseItems,
        leftIcon = false
    ) => {
        const ele = document.createElement("div");
        ele.className = "graph-save-transverse-item";
        const textEle = document.createElement("div");
        textEle.className = "graph-save-transverse-item-text";
        textEle.textContent = text;
        const iconEle = document.createElement("div");
        iconEle.className = "graph-save-transverse-item-icon";
        iconEle.innerHTML = leftIcon ? ICONS.left : ICONS.right;
        ele.appendChild(textEle);
        ele.appendChild(iconEle);
        ele.onclick = callback;

        if (transverseItems.length) {
            ele.classList.add("graph-save-transverse-item-tail");
        }

        transverseItems.push(ele);
    };

    const setFramework = (type, needRestart) => {
        const change = () => {
            MEMORY_SET(MEMORY_KEYS.CurrentFramework, type);
            MESSAGE_PUSH(MESSAGE_TYPE.FrameworkChanged, {
                framework: type,
            });
        };

        // clear copy anyway
        if (needRestart) {
            MESSAGE_CALL(MESSAGE_TYPE.RestartPage, {
                confirmCallback: change,
            });
        } else {
            MESSAGE_CALL(MESSAGE_TYPE.ClearCopyData);
            change();
        }
    };

    const showFrameworkSelectPage = (firstTime) => {
        const container = [];
        addTransverseItem(
            "PyTorch",
            () => {
                MESSAGE_CALL(MESSAGE_TYPE.CoveringClose, {
                    afterClose: setFramework.bind(
                        null,
                        FRAMEWORK.pytorch,
                        firstTime !== true
                    ),
                });
            },
            container
        );
        addTransverseItem(
            "MindSpore",
            () => {
                MESSAGE_CALL(MESSAGE_TYPE.CoveringClose, {
                    afterClose: setFramework.bind(
                        null,
                        FRAMEWORK.mindspore,
                        firstTime !== true
                    ),
                });
            },
            container
        );
        addTransverseItem(
            I18N_STRINGS.back,
            () => {
                MESSAGE_CALL(MESSAGE_TYPE.CoveringClose, {
                    afterClose: () => {
                        MESSAGE_PUSH(MESSAGE_TYPE.OpenGraphs, {
                            firstTime,
                        });
                    },
                });
            },
            container,
            true
        );
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: I18N_STRINGS.framework,
            elements: container,
        });
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
            const framework = MEMORY_GET(
                MEMORY_KEYS.CurrentFramework,
                FRAMEWORK.pytorch
            );
            let graphInfo;
            if (event.detail?.name) {
                graphInfo = {
                    name: event.detail?.name,
                    data: callResult[0],
                    timestamp: timestamp,
                    framework: framework,
                };
            } else {
                graphInfo = {
                    name: MEMORY_GET(
                        MEMORY_KEYS.CurrentGraphSaveName,
                        I18N_STRINGS.unnamed_graph
                    ),
                    data: callResult[0],
                    timestamp: timestamp,
                    framework: framework,
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

            if (event.detail?.firstTime !== true) {
                addTransverseItem(
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

            addTransverseItem(
                I18N_STRINGS.create_graph,
                () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose, {
                        afterClose: showFrameworkSelectPage.bind(
                            null,
                            event.detail?.firstTime
                        ),
                    });
                },
                transverseItems
            );

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
                    beforeClose: () => {
                        // compatible with previous versions
                        setFramework(
                            graphInfo.framework || FRAMEWORK.pytorch,
                            false
                        );

                        MESSAGE_CALL(MESSAGE_TYPE.ImportGraph, {
                            default: graphInfo.data,
                            withoutConfirm: true,
                        });

                        MESSAGE_CALL(MESSAGE_TYPE.OperationRecordReset);

                        MESSAGE_CALL(MESSAGE_TYPE.GraphSaved, {
                            timestamp: graphInfo.timestamp,
                            name: graphInfo.name,
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
                const { name, data, framework, timestamp, createTimestamp } =
                    graphInfo;

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

                const frameworkEle = document.createElement("div");
                frameworkEle.className = "graph-save-item-framework";
                frameworkEle.textContent = framework || FRAMEWORK.pytorch;

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
                item.appendChild(frameworkEle);
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

        MESSAGE_HANDLER(MESSAGE_TYPE.ChangeFramework, (event) => {
            if (event.detail?.framework === undefined) {
                console.debug("[ChangeFramework] unexpected event as", event);
                return;
            }

            setFramework(event.detail.framework);
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
