/**
 * MESSAGE_TYPE.AddTooltip
 *      <event.detail.element>
 *      <event.detail.textContent>
 */

const TOOLTIP = document.createElement("div");

const TOOLTIP_MARGIN = rootStyle
    .var("--tooltip-margin")
    .match(/\d+/g)
    .map(parseInt)[0];

(function () {
    function clearTooltip() {
        TOOLTIP.style.height = "0px";
        TOOLTIP.style.display = "none";
    }

    function showTooltip(textContent, left, eleTop, eleBottom) {
        TOOLTIP.textContent = textContent;
        TOOLTIP.style.height = "auto";
        TOOLTIP.style.display = "inline";
        TOOLTIP.style.visibility = "hidden";
        TOOLTIP.style.left = "0px";
        TOOLTIP.style.top = "0px";

        left = Math.min(
            Math.max(0, left - TOOLTIP.offsetWidth / 2),
            window.innerWidth - TOOLTIP.offsetWidth
        );
        let top;
        const height = TOOLTIP.offsetHeight;
        if (window.innerHeight - eleBottom >= height + TOOLTIP_MARGIN) {
            top = eleBottom + TOOLTIP_MARGIN;
        } else {
            top = Math.max(eleTop - height - TOOLTIP_MARGIN, 0);
        }

        TOOLTIP.style.left = `${left}px`;
        TOOLTIP.style.top = `${top}px`;
        TOOLTIP.style.visibility = "visible";
    }

    window.addEventListener("load", () => {
        TOOLTIP.className = "tooltip";
        document.body.appendChild(TOOLTIP);
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.AddTooltip, (event) => {
        if (
            event.detail?.element === undefined ||
            event.detail?.textContent === undefined
        ) {
            console.error("[Tooltip] get a unexpected event as", event);
            return;
        }

        const ele = event.detail.element;
        const textContent = event.detail?.textContent;
        TOOLTIP.removeEventListener("mouseenter", ele.tooltipOpenCallback);
        ele.tooltipOpenCallback = () => {
            const eleRect = ele.getBoundingClientRect();
            showTooltip(
                textContent,
                (eleRect.left + eleRect.right) / 2,
                eleRect.top,
                eleRect.bottom
            );
        };
        ele.addEventListener("mouseenter", ele.tooltipOpenCallback);

        if (ele.tooltipCloseCallback === undefined) {
            ele.tooltipCloseCallback = clearTooltip;
            ele.addEventListener("mouseleave", ele.tooltipCloseCallback);
        }
    });
})();
