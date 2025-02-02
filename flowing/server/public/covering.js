/**
 * MESSAGE_TYPE.CoveringShowCustom
 *      push <event.detail.title(str)> to covering.
 *      push <event.detail.text(str)> to covering.
 *      push close button if <event.detail.buttonMode(COVERING_BUTTON_MODE))>.
 *          this will call <event.detail.buttonCallback.close>/<event.detail.buttonCallback.confirm>/<event.detail.buttonCallback.cancel>
 *      push <event.detail.elements(DOM-s)> to covering, and show.
 *      call <event.detail.afterInit>
 *
 * MESSAGE_TYPE.CoveringClose
 *      close covering page
 *
 */

const COVERING_BUTTON_MODE = {
    CloseButton: 0,
    ConfirmAndCancelButton: 1,
};

const COVERING = document.createElement("div");
COVERING.className = "covering";

(function () {
    window.addEventListener("load", () => {
        document.body.appendChild(COVERING);
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.CoveringShowCustom, (event) => {
        if (COVERING.style.height === "100%") {
            return;
        }
        let coveringContainerEle = document.createElement("div");
        coveringContainerEle.className = "covering-container";
        COVERING.appendChild(coveringContainerEle);
        if (event.detail?.title) {
            const titleEle = document.createElement("h1");
            titleEle.textContent = event.detail.title;
            coveringContainerEle.appendChild(titleEle);
        }
        if (event.detail?.text) {
            const textEle = document.createElement("p");
            textEle.textContent = event.detail.text;
            coveringContainerEle.appendChild(textEle);
        }
        if (event.detail?.elements) {
            for (const ele of event.detail.elements) {
                coveringContainerEle.appendChild(ele);
            }
        }

        const buttonBar = document.createElement("div");
        buttonBar.className = "covering-button-bar";
        switch (event.detail?.buttonMode) {
            case COVERING_BUTTON_MODE.CloseButton:
                const closeButtonEle = document.createElement("div");
                closeButtonEle.className = "covering-button";
                closeButtonEle.title = "Close";
                closeButtonEle.innerHTML = ICONS.cross;
                closeButtonEle.onclick = () => {
                    if (event.detail?.buttonCallback?.close) {
                        event.detail.buttonCallback.close();
                    }
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                };
                buttonBar.appendChild(closeButtonEle);
                break;
            case COVERING_BUTTON_MODE.ConfirmAndCancelButton:
                const confirmButtonEle = document.createElement("div");
                confirmButtonEle.className = "covering-button";
                confirmButtonEle.title = "Confirm";
                confirmButtonEle.innerHTML = ICONS.check;
                confirmButtonEle.onclick = () => {
                    if (event.detail?.buttonCallback?.confirm) {
                        event.detail.buttonCallback.confirm();
                    }
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                };
                buttonBar.appendChild(confirmButtonEle);

                const cancelButtonEle = document.createElement("div");
                cancelButtonEle.className = "covering-button";
                cancelButtonEle.title = "Cancel";
                cancelButtonEle.innerHTML = ICONS.cross;
                cancelButtonEle.onclick = () => {
                    if (event.detail?.buttonCallback?.cancel) {
                        event.detail.buttonCallback.cancel();
                    }
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                };
                buttonBar.appendChild(cancelButtonEle);
                break;
            default:
                break;
        }
        if (buttonBar.childNodes.length) {
            coveringContainerEle.appendChild(buttonBar);
        } else {
            buttonBar.remove();
        }
        COVERING.style.height = "100%";

        if (event.detail?.afterInit) {
            event.detail.afterInit();
        }
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.CoveringClose, () => {
        COVERING.style.height = "0";
        while (COVERING.firstChild) {
            COVERING.removeChild(COVERING.firstChild);
        }
    });
})();
