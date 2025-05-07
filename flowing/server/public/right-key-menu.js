/**
 * MESSAGE_TYPE.RightKeyMenuShow
 *      only supported at most 2 level menu
 *      <event.detail.items[x].isSeparator> === true => separator
 *      <event.detail.items[x].title>
 *      <event.detail.items[x].callback>
 *      <event.detail.items[x].disabledCheck>
 *          <event.detail.items[x].disabled> === true or <event.detail.items[x].callback> is undefined or <event.detail.items[x].disabledCheck>()==true -> item will be disabled.
 *      <event.detail.items[x].subItems>
 *      <event.detail.items[x].underline>
 *      <event.detail.closeCallback> call when close. (menuCloseReason:e)=>{}, only first layer supported.
 *      <event.detail.showLeft> + <event.detail.showTop> => where to show
 */

const RIGHT_KEY_MENUS = [
    document.createElement("div"),
    document.createElement("div"),
];

const RIGHT_KEY_MENU_CLOSE_CALLBACKS = new Array(RIGHT_KEY_MENUS.length).fill(
    undefined
);

const RIGHT_KEY_MENU_MARGIN = rootStyle
    .var("--right-key-menu-margin")
    .match(/\d+/g)
    .map(parseInt)[0];

const RIGHT_KEY_MENU_CLOSE_REASON = {
    OpenAnotherMenu: 0,
    ClickedOther: 1,
    ClickedItem: 2,
};

(function () {
    window.addEventListener("load", () => {
        for (const menuEle of RIGHT_KEY_MENUS) {
            menuEle.classList.add("right-key-menu");
            document.body.appendChild(menuEle);
        }
    });

    function clearMenu(eleIdx, menuCloseReason) {
        if (eleIdx >= RIGHT_KEY_MENUS.length) {
            return;
        }

        const ele = RIGHT_KEY_MENUS[eleIdx];

        ele.style.height = "0px";
        ele.style.display = "none";

        while (ele.firstChild) {
            ele.removeChild(ele.firstChild);
        }

        RIGHT_KEY_MENU_CLOSE_CALLBACKS[eleIdx]?.(menuCloseReason);
        RIGHT_KEY_MENU_CLOSE_CALLBACKS[eleIdx] = undefined;
    }

    function clearRightKeyMenu(menuCloseReason) {
        for (let idx = RIGHT_KEY_MENUS.length - 1; idx >= 0; idx--) {
            clearMenu(idx, menuCloseReason);
        }
    }

    function showMenu(ele, expectedLeft, expectedTop) {
        ele.style.display = "inline";
        ele.style.height = "auto";
        ele.style.visibility = "hidden";

        // assumes that all menus will display continuously.
        let occupiedLeft = 0,
            occupiedRight = 0;
        for (const otherEle of RIGHT_KEY_MENUS) {
            if (
                otherEle.style.display !== "none" &&
                otherEle.style.visibility === "visible"
            ) {
                occupiedLeft = Math.max(occupiedLeft, otherEle.offsetLeft);
                occupiedRight = Math.max(
                    occupiedRight,
                    otherEle.offsetLeft + otherEle.offsetWidth
                );
            }
        }

        // when occupiedLeft!=occupiedRight, expectedLeft is useless
        // [0, occupiedLeft-ele.offsetWidth)
        // (occupiedRight, document.body.clientWidth-ele.offsetWidth]
        let left;
        if (occupiedLeft === occupiedRight) {
            left = Math.min(
                Math.max(expectedLeft, 0),
                document.body.clientWidth - ele.offsetWidth
            );
        } else if (
            occupiedRight <=
            document.body.clientWidth - ele.offsetWidth
        ) {
            left = occupiedRight;
        } else if (occupiedLeft >= ele.offsetWidth) {
            left = occupiedLeft - ele.offsetWidth;
        } else {
            console.warn("[right-key-menu] not enough space!");
            left = document.body.clientWidth - ele.offsetWidth;
        }
        ele.style.left = `${left}px`;

        // [0, document.body.clientHeight]
        ele.style.top = `${Math.min(
            Math.max(expectedTop, 0),
            document.body.clientHeight - ele.offsetHeight
        )}px`;

        ele.style.visibility = "visible";
    }

    function initMenu(eleIdx, items, closeCallback, left, top) {
        if (eleIdx >= RIGHT_KEY_MENUS.length) {
            console.error("[right-key-menu] too much layers!");
            return;
        }
        clearMenu(eleIdx, RIGHT_KEY_MENU_CLOSE_REASON.OpenAnotherMenu);
        for (const info of items) {
            const {
                isSeparator,
                title,
                callback,
                disabled,
                disabledCheck,
                icon,
                keyTips,
                subItems,
                underline,
            } = info;

            if (isSeparator) {
                const sep = document.createElement("div");
                sep.className = "right-key-menu-separator";
                RIGHT_KEY_MENUS[eleIdx].appendChild(sep);
                continue;
            }

            let isDisabled =
                callback === undefined ||
                disabled === true ||
                disabledCheck?.();

            const item = document.createElement("div");
            item.className = "right-key-menu-item";

            const iconEle = document.createElement("div");
            iconEle.className = "right-key-menu-item-icon";
            if (icon) {
                iconEle.innerHTML = icon;
            }
            item.appendChild(iconEle);

            const titleEle = document.createElement("div");
            titleEle.classList.add("right-key-menu-item-title");
            titleEle.textContent = title;
            item.appendChild(titleEle);

            const keyTipsEle = document.createElement("div");
            keyTipsEle.className = "right-key-menu-item-key-tips";
            if (keyTips) {
                keyTipsEle.textContent = keyTips;
            }
            item.appendChild(keyTipsEle);

            item.onclick = () => {
                callback?.();
                clearRightKeyMenu(RIGHT_KEY_MENU_CLOSE_REASON.ClickedItem);
            };

            if (subItems) {
                keyTipsEle.textContent = ">";
                item.onmouseenter = () => {
                    initMenu(
                        eleIdx + 1,
                        subItems,
                        () => {
                            item.classList.remove(
                                "right-key-menu-item-selected"
                            );
                        },
                        RIGHT_KEY_MENUS[eleIdx].offsetLeft + item.offsetWidth,
                        RIGHT_KEY_MENUS[eleIdx].offsetTop +
                            item.offsetTop -
                            RIGHT_KEY_MENU_MARGIN
                    );
                    item.classList.add("right-key-menu-item-selected");
                };
                // no disabled, no onclick
                isDisabled = false;
                item.onclick = undefined;
            } else {
                item.onmouseenter = () => {
                    clearMenu(
                        eleIdx + 1,
                        RIGHT_KEY_MENU_CLOSE_REASON.OpenAnotherMenu
                    );
                };
            }

            if (isDisabled) {
                item.classList.add("right-key-menu-item-disabled");
            }

            if (underline) {
                item.classList.add("right-key-menu-item-underline");
            }

            RIGHT_KEY_MENUS[eleIdx].appendChild(item);
        }

        RIGHT_KEY_MENU_CLOSE_CALLBACKS[eleIdx] = closeCallback;

        showMenu(RIGHT_KEY_MENUS[eleIdx], left, top);
    }

    function pointOutOfRightKeyMenu(e) {
        if (
            RIGHT_KEY_MENUS.reduce((prev, ele) => {
                return prev && e.target !== ele && !ele.contains(e.target);
            }, true)
        ) {
            clearRightKeyMenu(RIGHT_KEY_MENU_CLOSE_REASON.ClickedOther);
            document.removeEventListener(
                "pointerdown",
                clearRightKeyMenu,
                false
            );
        }
    }

    MESSAGE_HANDLER(MESSAGE_TYPE.RightKeyMenuShow, (event) => {
        clearRightKeyMenu(RIGHT_KEY_MENU_CLOSE_REASON.OpenAnotherMenu);

        if (
            event.detail?.showLeft === undefined ||
            event.detail?.showTop === undefined ||
            event.detail?.items === undefined
        ) {
            console.error(
                "[right-key-menu] get a event that no showLeft or showTop."
            );
            return;
        }

        document.addEventListener("pointerdown", pointOutOfRightKeyMenu, false);

        initMenu(
            0,
            event.detail.items,
            event.detail.closeCallback,
            event.detail.showLeft,
            event.detail.showTop
        );
    });
})();
