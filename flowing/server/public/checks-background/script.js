/**
 * <MESSAGE_TYPE.ChangeChecksBackground>
 *      <event.detail.scale>
 *      <event.detail.offsetLeft>
 *      <event.detail.offsetTop>
 *
 */

const CHECKS_BACKGROUND_BASE_SIZE = Math.min(
    rootStyle.var("--node-width").match(/\d+/g).map(parseInt)[0],
    rootStyle.var("--node-height").match(/\d+/g).map(parseInt)[0]
);

const CHECKS_BACKGROUND_MIN_SIZE = CHECKS_BACKGROUND_BASE_SIZE;

(function () {
    function getSuitableChecksSize(expectedSize) {
        while (expectedSize < CHECKS_BACKGROUND_MIN_SIZE) {
            expectedSize *= 2;
        }
        return expectedSize;
    }

    function setChecksBackground(divElement, scale, offsetLeft, offsetTop) {
        const size = getSuitableChecksSize(CHECKS_BACKGROUND_BASE_SIZE * scale);

        divElement.style.backgroundImage = `linear-gradient(to right, var(--checks-line-color) 1px,transparent 0), linear-gradient(to bottom, var(--checks-line-color) 1px, transparent 0)`;
        divElement.style.backgroundSize = `${size}px ${size}px`;
        divElement.style.backgroundPosition = `${offsetLeft * scale}px ${
            offsetTop * scale
        }px`;
    }

    window.addChecksBackgroundTo = (divElement) => {
        MESSAGE_HANDLER(MESSAGE_TYPE.ChangeChecksBackground, (event) => {
            if (
                event.detail?.scale == undefined ||
                event.detail?.offsetLeft == undefined ||
                event.detail?.offsetTop == undefined
            ) {
                console.error(
                    "[ChangeChecksBackground] unexpected params",
                    event
                );
                return;
            }
            setChecksBackground(
                divElement,
                event.detail.scale,
                event.detail.offsetLeft,
                event.detail.offsetTop
            );
        });
    };
})();
