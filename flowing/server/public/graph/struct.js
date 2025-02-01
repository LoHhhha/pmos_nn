class Point {
    nodeId;
    endpointIdx;

    constructor(nodeId, endpointIdx) {
        this.nodeId = nodeId;
        this.endpointIdx = endpointIdx;
    }
}

class NodeDataPair {
    net_node_idx;
    data_idx;

    constructor(net_node_idx, data_idx = 0) {
        this.net_node_idx = net_node_idx;
        this.data_idx = data_idx;
    }
}

class LayerNode {
    api_name;
    from_data;
    args; // {key:..., value:...}

    constructor(api_name) {
        this.api_name = api_name;
        this.from_data = [];
        this.args = [];
    }
}

class InputNode {
    shape;
    to_data;
    name;

    constructor(shape) {
        this.name = null;
        this.shape = shape;
        this.to_data = [];
    }
}

class OutputNode {
    from_data;
    name;

    constructor() {
        this.name = null;
        this.from_data = null;
    }
}

class Graph {
    net_nodes;
    input_nodes;
    output_nodes;

    constructor() {
        this.net_nodes = [];
        this.input_nodes = [];
        this.output_nodes = [];
    }
}
