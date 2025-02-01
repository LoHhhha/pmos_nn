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
                closeButtonEle.innerHTML =
                    '<svg class="covering-button-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>';
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
                confirmButtonEle.innerHTML =
                    '<svg class="covering-button-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>';
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
                cancelButtonEle.innerHTML =
                    '<svg class="covering-button-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>';
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
