// graphInfo = {
//     name: ...,
//     data: ...,
//     createTimestamp: ...,
//     timestamp: ...,
// };

class GraphSaveUtils {
    static getGraphKeys() {
        const graphKeysStr = READ_FROM_LOCAL(MEMORY_KEYS.GraphKeys);
        if (graphKeysStr === undefined) {
            console.warn("[GraphSaveHelper] GraphKeys not found");
            SAVE_TO_LOCAL(MEMORY_KEYS.GraphKeys, JSON.stringify([]));
            return [];
        }

        let graphKeys;
        try {
            graphKeys = JSON.parse(graphKeysStr);
            if (!graphKeys instanceof Array) {
                throw "not array";
            }
        } catch (err) {
            console.error(
                `[GraphSaveHelper] get unexpect GraphKeys as ${graphKeysStr}!`
            );
            SAVE_TO_LOCAL(MEMORY_KEYS.GraphKeys, JSON.stringify([]));
            return [];
        }
        return graphKeys;
    }

    static getGraph(graphKey) {
        // {timestamp:int,createTimestamp:int,data:JsonStr,name:str}
        const graphInfoStr = READ_FROM_LOCAL(graphKey);
        if (graphInfoStr === undefined) {
            console.error(
                `[GraphSaveHelper] graphKey as ${graphKey} not found!`
            );
            return undefined;
        }

        let graphInfo;
        try {
            graphInfo = JSON.parse(graphInfoStr);
        } catch (err) {
            console.error(
                `[GraphSaveHelper] get unexpect graphInfo as ${graphInfoStr} from graphKey as ${graphKey}!`
            );
            return undefined;
        }
        return graphInfo;
    }

    static getGraphs() {
        const graphs = []; // [{graphInfo:{timestamp:int,createTimestamp:int,data:JsonStr,name:str}, graphKey}]

        const graphKeys = GraphSaveUtils.getGraphKeys();
        const newGraphKeys = [];

        for (const graphKey of graphKeys) {
            const graphInfo = GraphSaveUtils.getGraph(graphKey); // {timestamp:int,createTimestamp:int,data:JsonStr,name:str}
            if (graphInfo === undefined) {
                continue;
            }

            graphs.push({ graphInfo, graphKey });
            newGraphKeys.push(graphKey);
        }

        if (graphKeys.length !== newGraphKeys.length) {
            console.warn("[GraphSaveHelper] detect some graph was missing", {
                graphKeys,
                newGraphKeys,
            });
            SAVE_TO_LOCAL(MEMORY_KEYS.GraphKeys, JSON.stringify(newGraphKeys));
        }
        return graphs;
    }

    static deleteGraph(graphKey) {
        const graphKeys = GraphSaveUtils.getGraphKeys();
        const newGraphKeys = graphKeys.filter((key) => key !== graphKey);
        if (graphKeys.length === newGraphKeys.length) {
            console.warn(
                `[GraphSaveHelper] not graphKey as ${graphKey} in GraphKeys as ${graphKeys}!`
            );
            return;
        }

        SAVE_TO_LOCAL(MEMORY_KEYS.GraphKeys, JSON.stringify(newGraphKeys));
        DELETE_FROM_LOCAL(graphKey);
    }

    static updateGraph(graphKey, graphInfo) {
        // create when graphKey not exist
        let prevGraphInfo = {};

        const graphKeys = GraphSaveUtils.getGraphKeys();
        if (!graphKeys.includes(graphKey)) {
            console.warn(
                `[GraphSaveHelper] graphKey as ${graphKey} not found, create it!`
            );
            graphKeys.push(graphKey);
            SAVE_TO_LOCAL(MEMORY_KEYS.GraphKeys, JSON.stringify(graphKeys));
        } else {
            prevGraphInfo = GraphSaveUtils.getGraph(graphKey) || prevGraphInfo;
        }

        // set graph
        SAVE_TO_LOCAL(
            graphKey,
            JSON.stringify({
                ...prevGraphInfo,
                ...graphInfo, // new value first
            })
        );
    }

    static addGraph(graphInfo) {
        // add graphInfo into memory, and return a graphKey
        // graphInfo {timestamp:int,createTimestamp:int,data:JsonStr,name:str}

        const graphKey = `pmos-graph-${new Date().getTime()}`;

        GraphSaveUtils.updateGraph(graphKey, graphInfo);

        return graphKey;
    }
}
