/**
 * MESSAGE_TYPE.RightKeyMenuShow
 *      <event.detail.items[x].title> + <event.detail.items[x].callback> => item
 *      <event.detail.items[x].disabled> === true or <event.detail.items[x].callback> is undefined -> item will be disabled.
 *      <event.detail.showLeft> + <event.detail.showTop> => where to show
 *
 */

const RIGHT_KEY_MENU = document.createElement("div");
RIGHT_KEY_MENU.className = "right-key-menu";

(function () {
    window.addEventListener("load", () => {
        document.body.appendChild(RIGHT_KEY_MENU);
    });

    function clearRightKeyMenu() {
        RIGHT_KEY_MENU.style.height = "0px";
        RIGHT_KEY_MENU.style.display = "none";
        while (RIGHT_KEY_MENU.firstChild) {
            RIGHT_KEY_MENU.removeChild(RIGHT_KEY_MENU.firstChild);
        }
    }

    function pointOutOfRightKeyMenu(e) {
        if (e.target !== RIGHT_KEY_MENU && !RIGHT_KEY_MENU.contains(e.target)) {
            clearRightKeyMenu();
            document.removeEventListener(
                "pointerdown",
                clearRightKeyMenu,
                false
            );
        }
    }

    MESSAGE_HANDLER(MESSAGE_TYPE.RightKeyMenuShow, (event) => {
        clearRightKeyMenu();

        if (
            event.detail.showLeft === undefined ||
            event.detail.showTop === undefined
        ) {
            console.error(
                "[right-key-menu] get a event that no showLeft or showTop."
            );
            return;
        }

        for (const info of event.detail.items) {
            const { title, callback, disabled, icon, keyTips } = info;

            const isDisabled = callback === undefined || disabled === true;

            const item = document.createElement("div");
            item.className = "right-key-menu-item";

            const iconEle = document.createElement("div");
            iconEle.className = "right-key-menu-item-icon";
            if (icon) {
                iconEle.innerHTML = icon;
            }
            item.appendChild(iconEle);

            const titleEle = document.createElement("div");
            titleEle.className = "right-key-menu-item-title";
            titleEle.textContent = title;
            item.appendChild(titleEle);

            const keyTipsEle = document.createElement("div");
            keyTipsEle.className = "right-key-menu-item-key-tips";
            if (keyTips) {
                keyTipsEle.textContent = keyTips;
            }
            item.appendChild(keyTipsEle);

            if (isDisabled) {
                item.classList.add("item-disabled");
            }

            item.onclick = () => {
                if (callback) {
                    callback();
                }
                clearRightKeyMenu();
            };

            RIGHT_KEY_MENU.appendChild(item);
        }

        document.addEventListener("pointerdown", pointOutOfRightKeyMenu, false);

        RIGHT_KEY_MENU.style.display = "inline";
        RIGHT_KEY_MENU.style.height = "auto";
        RIGHT_KEY_MENU.style.visibility = "hidden";

        RIGHT_KEY_MENU.style.left = `${Math.min(
            event.detail.showLeft,
            document.body.clientWidth - RIGHT_KEY_MENU.offsetWidth
        )}px`;
        RIGHT_KEY_MENU.style.top = `${Math.min(
            event.detail.showTop,
            document.body.clientHeight - RIGHT_KEY_MENU.offsetHeight
        )}px`;

        RIGHT_KEY_MENU.style.visibility = "visible";
    });
})();
