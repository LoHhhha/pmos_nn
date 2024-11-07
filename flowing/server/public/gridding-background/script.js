(function () {
    const rootStyle = getComputedStyle(document.querySelector(":root"));
    rootStyle.var = (key) => rootStyle.getPropertyValue(key);

    function setGridding(divElement, scale, offsetLeft, offsetTop) {
        const nodeSize = Math.min(
            rootStyle.var("--node-width").match(/\d+/g).map(parseInt)[0],
            rootStyle.var("--node-height").match(/\d+/g).map(parseInt)[0]
        );
        const size = nodeSize * scale;

        divElement.style.backgroundImage = `linear-gradient(to right, var(--gridding-line-color) 1px,transparent 0), linear-gradient(to bottom, var(--gridding-line-color) 1px, transparent 0)`;
        divElement.style.backgroundSize = `${size}px ${size}px`;
        divElement.style.backgroundPosition = `${offsetLeft * scale}px ${
            offsetTop * scale
        }px`;
    }

    window.addGriddingBackGroupTo = (divElement) => {
        divElement.addEventListener("change-gridding", (event) => {
            setGridding(
                divElement,
                event.detail.scale,
                event.detail.offsetLeft,
                event.detail.offsetTop
            );
        });
    };
})();
