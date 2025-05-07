/**
 * MESSAGE_TYPE.CoveringShow
 *      push <event.detail.title(str)> to covering.
 *      push <event.detail.text(str)> to covering.
 *      push close button if <event.detail.buttonMode(COVERING_BUTTON_MODE))>.
 *          this will call <event.detail.buttonCallback.close>/<event.detail.buttonCallback.confirm>/<event.detail.buttonCallback.cancel>
 *      push <event.detail.elements(DOM-s)> to covering, and show.
 *      call <event.detail.init>
 *      call <event.detail.afterInit> call when transition ends
 *      if <event.detail.autoElementsContainerScroll> auto scroll CoveringElementsContainerEle
 *
 * MESSAGE_TYPE.CoveringClose
 *      close covering page
 *      call <event.detail.afterClose> call when transition ends
 */

const COVERING_BUTTON_MODE = {
    CloseButton: 0,
    ConfirmAndCancelButton: 1,
};

const COVERING_KEY_NAMESPACE = "COVERING";

const COVERING = document.createElement("div");
COVERING.className = "covering";
// .containerEle
// .elementsContainerEle?
//      .selfObserver?
//      .autoScrolling?
//      .userScrolling?
//      .autoScrollingTarget?
//      .scrollTimeout?
// .closeCallBack

const COVERING_AUTO_SCROLL_EPS = 10;
const COVERING_USER_SCROLL_TIMEOUT = 100;

(function () {
    window.addEventListener("load", () => {
        document.getElementById("main-window").appendChild(COVERING);
        COVERING.closeCallBack = new Array();
    });

    const callWhenTransitionEnd = (...callbacks) => {
        const animationendCallback = () => {
            for (const callback of callbacks) {
                if (callback) {
                    callback();
                }
            }
            COVERING.removeEventListener("transitionend", animationendCallback);
        };
        COVERING.addEventListener("transitionend", animationendCallback);
    };

    const addAutoScroll = (ele) => {
        ele.autoScrolling = true;
        ele.userScrolling = false;
        ele.autoScrollingTarget = null;
        const updateAutoScrolling = () => {
            ele.autoScrolling = ele.scrollHeight
                ? ele.scrollHeight - ele.scrollTop <=
                  ele.clientHeight + COVERING_AUTO_SCROLL_EPS
                : true;
            if (!ele.autoScrolling) {
                ele.autoScrollingTarget = null;
            }
        };
        ele.selfObserver = new MutationObserver(() => {
            if (ele.autoScrolling && !ele.userScrolling) {
                requestAnimationFrame(() => {
                    ele.autoScrollingTarget = ele.scrollHeight;
                    ele.scrollTo({
                        top: ele.scrollHeight,
                    });
                });
            }
            if (!ele.autoScrolling) {
                updateAutoScrolling();
            }
        });
        ele.addEventListener("scroll", () => {
            if (ele.autoScrollingTarget === ele.scrollHeight) {
                ele.autoScrollingTarget = null;
                return;
            }

            ele.userScrolling = true;
            clearTimeout(ele.scrollTimeout);

            updateAutoScrolling();

            ele.scrollTimeout = setTimeout(() => {
                ele.userScrolling = false;
            }, COVERING_USER_SCROLL_TIMEOUT);
        });
        ele.selfObserver.observe(ele, {
            childList: true,
            subtree: true,
            characterData: true,
        });
        COVERING.closeCallBack.push(() => ele.selfObserver.disconnect());
    };

    const callWhenKeyDown = (keyCode, modifierKeyCodes, callback) => {
        const key = ADD_KEY_HANDLER(
            COVERING_KEY_NAMESPACE,
            keyCode,
            modifierKeyCodes,
            callback
        );
        COVERING.closeCallBack.push(() =>
            DELETE_KEY_HANDLER(COVERING_KEY_NAMESPACE, key, callback)
        );
    };

    MESSAGE_HANDLER(MESSAGE_TYPE.CoveringShow, (event) => {
        if (COVERING.style.height === "100%") {
            console.error("[Covering] More than one want to show covering!");
            return;
        }

        MESSAGE_CALL(MESSAGE_TYPE.PromptStop);

        ENTER_NEW_KEY_NAMESPACE(COVERING_KEY_NAMESPACE);

        const coveringContainerEle = document.createElement("div");
        coveringContainerEle.className = "covering-container";
        COVERING.appendChild(coveringContainerEle);
        COVERING.containerEle = coveringContainerEle;

        if (event.detail?.title) {
            const titleEle = document.createElement("h1");
            titleEle.id = "covering-title";
            titleEle.textContent = event.detail.title;
            coveringContainerEle.appendChild(titleEle);
        }
        if (event.detail?.text) {
            const textEle = document.createElement("p");
            textEle.id = "covering-text";
            textEle.innerHTML = event.detail.text;
            coveringContainerEle.appendChild(textEle);
        }
        if (event.detail?.elements) {
            const coveringElementsContainerEle = document.createElement("div");
            coveringElementsContainerEle.className =
                "covering-elements-container";
            coveringContainerEle.appendChild(coveringElementsContainerEle);
            COVERING.elementsContainerEle = coveringElementsContainerEle;

            for (const ele of event.detail.elements) {
                coveringElementsContainerEle.appendChild(ele);
            }

            if (event.detail?.autoElementsContainerScroll) {
                addAutoScroll(coveringElementsContainerEle);
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
                    callWhenTransitionEnd(event.detail?.buttonCallback?.close);
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                };
                buttonBar.appendChild(closeButtonEle);

                callWhenKeyDown("Escape", [], closeButtonEle.onclick);
                break;
            case COVERING_BUTTON_MODE.ConfirmAndCancelButton:
                const confirmButtonEle = document.createElement("div");
                confirmButtonEle.className = "covering-button";
                confirmButtonEle.title = "Confirm";
                confirmButtonEle.innerHTML = ICONS.check;
                confirmButtonEle.onclick = () => {
                    callWhenTransitionEnd(
                        event.detail?.buttonCallback?.confirm
                    );
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                };
                buttonBar.appendChild(confirmButtonEle);

                const cancelButtonEle = document.createElement("div");
                cancelButtonEle.className = "covering-button";
                cancelButtonEle.title = "Cancel";
                cancelButtonEle.innerHTML = ICONS.cross;
                cancelButtonEle.onclick = () => {
                    callWhenTransitionEnd(event.detail?.buttonCallback?.cancel);
                    MESSAGE_PUSH(MESSAGE_TYPE.CoveringClose);
                };
                buttonBar.appendChild(cancelButtonEle);

                callWhenKeyDown("Escape", [], cancelButtonEle.onclick);
                break;
            default:
                break;
        }
        if (buttonBar.childNodes.length) {
            coveringContainerEle.appendChild(buttonBar);
        } else {
            buttonBar.remove();
        }

        document.activeElement.blur();
        if (event.detail?.init) {
            event.detail?.init();
        }

        callWhenTransitionEnd(event.detail?.afterInit);

        COVERING.style.height = "100%";
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.CoveringClose, (event) => {
        callWhenTransitionEnd(() => {
            MESSAGE_PUSH(MESSAGE_TYPE.PromptStart);
        }, event.detail?.afterClose);

        COVERING.style.height = "0";

        while (COVERING.firstChild) {
            COVERING.removeChild(COVERING.firstChild);
        }

        while (COVERING.closeCallBack.length) {
            COVERING.closeCallBack.pop()();
        }

        EXIT_KEY_NAMESPACE(COVERING_KEY_NAMESPACE);
    });
})();
