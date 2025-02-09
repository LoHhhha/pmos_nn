(function () {
    const nodeSize = Math.min(
        rootStyle.var("--node-width").match(/\d+/g).map(parseInt)[0],
        rootStyle.var("--node-height").match(/\d+/g).map(parseInt)[0]
    );

    function setGridding(divElement, scale, offsetLeft, offsetTop) {
        const size = nodeSize * scale;

        divElement.style.backgroundImage = `linear-gradient(to right, var(--gridding-line-color) 1px,transparent 0), linear-gradient(to bottom, var(--gridding-line-color) 1px, transparent 0)`;
        divElement.style.backgroundSize = `${size}px ${size}px`;
        divElement.style.backgroundPosition = `${offsetLeft * scale}px ${
            offsetTop * scale
        }px`;
    }

    window.addGriddingBackGroupTo = (divElement) => {
        MESSAGE_HANDLER(MESSAGE_TYPE.ChangeGridding, (event) => {
            if (
                event.detail?.scale == undefined ||
                event.detail?.offsetLeft == undefined ||
                event.detail?.offsetTop == undefined
            ) {
                console.error("[ChangeGridding] unexpected params", event);
                return;
            }
            setGridding(
                divElement,
                event.detail.scale,
                event.detail.offsetLeft,
                event.detail.offsetTop
            );
        });
    };
})();
