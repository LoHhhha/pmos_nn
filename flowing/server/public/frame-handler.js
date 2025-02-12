const CALL_QUEUE_AMOUNT = 8;

const NEXT_FRAME_CALL_QUEUE = new Array(CALL_QUEUE_AMOUNT);
for (let idx = 0; idx < CALL_QUEUE_AMOUNT; idx++) {
    NEXT_FRAME_CALL_QUEUE[idx] = new Array();
}

const _GET_VALID_CALL_WEIGHT = (weight) => {
    if (weight >= CALL_QUEUE_AMOUNT || weight < 0) {
        console.warn("[FrameHandler] unexpected weight!");
        weight = Math.max(0, Math.min(CALL_QUEUE_AMOUNT - 1, weight));
    }
    return weight;
};

const CALL_BEFORE_NEXT_FRAME = (weight, handler) => {
    weight = _GET_VALID_CALL_WEIGHT(weight);
    NEXT_FRAME_CALL_QUEUE[weight].push({
        handler: handler,
        forever: false,
    });
};

const CALL_BEFORE_EVERY_FRAME = (weight, handler) => {
    weight = _GET_VALID_CALL_WEIGHT(weight);
    NEXT_FRAME_CALL_QUEUE[weight].push({
        handler: handler,
        forever: true,
    });
};

const DELETE_FRAME_HANDLER = (weight, handler) => {
    weight = _GET_VALID_CALL_WEIGHT(weight);
    NEXT_FRAME_CALL_QUEUE[weight] = NEXT_FRAME_CALL_QUEUE[weight].filter(
        (item) => item.handler !== handler
    );
};

const FRAME_HANDLER = () => {
    for (const queue of NEXT_FRAME_CALL_QUEUE) {
        let amount = queue.length;
        while (amount--) {
            const { handler, forever } = queue.shift();
            handler();
            if (forever) {
                queue.push({
                    handler: handler,
                    forever: forever,
                });
            }
        }
    }
    window.requestAnimationFrame(FRAME_HANDLER);
};

(function () {
    window.requestAnimationFrame(FRAME_HANDLER);
})();
