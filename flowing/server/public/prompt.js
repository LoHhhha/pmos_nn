/**
 * MESSAGE_TYPE.ShowDefaultPrompt
 *      <event.detail.config: ShowDefaultPrompt.xxx>
 *      <event.detail.content>
 *      [<event.detail.closeCallback: Func> return true will not close.]
 *      [<event.detail.onclick: Func>]
 *      [<event.detail.timeout>]
 */

const PROMPT_CONFIG = {
    INFO: {
        name: "prompt-info",
        iconSvg: ICONS.info,
        onclick: (promptItem) => {
            promptItem.dispose();
        },
        closeCallback: undefined,
        timeout: 5000,
        // color: rootStyle.var("--prompt-item-info-background-color"),
    },
    WARNING: {
        name: "prompt-warning",
        iconSvg: ICONS.warning,
        onclick: (promptItem) => {
            promptItem.dispose();
        },
        closeCallback: undefined,
        timeout: undefined,
        color: rootStyle.var("--prompt-item-warning-background-color"),
    },
    ERROR: {
        name: "prompt-error",
        iconSvg: ICONS.error,
        onclick: (promptItem) => {
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
                title: "Error",
                text: promptItem.text,
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
            });
            promptItem.dispose();
        },
        closeCallback: undefined,
        timeout: undefined,
        color: rootStyle.var("--prompt-item-error-background-color"),
    },
};

const PROMPT = document.createElement("div");
const PROMPT_MORE = document.createElement("div");
const PROMPT_MORE_SVG = ICONS.more;
const PROMPT_QUEUE = new Array(0);

class PromptItem {
    icon;
    content;
    element;

    container;
    closeCallback;
    defaultCloseCallback;
    timeout;
    text;

    constructor(
        container,
        iconSvg,
        text,
        onclick = undefined,
        closeCallback = undefined,
        defaultCloseCallback = undefined,
        color = undefined,
        timeout = undefined
    ) {
        this.element = document.createElement("div");
        this.element.className = "prompt-item";

        this.icon = document.createElement("div");
        this.icon.className = "prompt-item-icon";
        this.icon.innerHTML = iconSvg;

        this.content = document.createElement("div");
        this.content.className = "prompt-item-content";
        this.content.textContent = text;

        this.element.appendChild(this.icon);
        this.element.appendChild(this.content);

        if (color) {
            this.element.style.backgroundColor = color;
        }

        if (onclick) {
            this.element.onclick = onclick.bind(this, this);
        }

        this.container = container;
        this.closeCallback = closeCallback;
        this.defaultCloseCallback = defaultCloseCallback;
        this.timeout = timeout;
        this.text = text;
    }

    activate() {
        if (this.timeout) {
            setTimeout(() => {
                this.dispose();
            }, this.timeout);
        }
        this.container.appendChild(this.element);
    }

    isDispose = false;
    dispose() {
        if (!this.isDispose) {
            if (this.closeCallback instanceof Function) {
                if (this.closeCallback()) {
                    return;
                }
            }
            this.isDispose = true;
            this.element.remove();
            this.defaultCloseCallback();
        }
    }
}

function updateMoreIconDisplay() {
    PROMPT_MORE.style.display = PROMPT_QUEUE.length > 1 ? "inline" : "none";
}

function addPrompt(prompt) {
    if (!PROMPT_QUEUE.length) {
        prompt.activate();
    }
    PROMPT_QUEUE.push(prompt);
    updateMoreIconDisplay();
}

function defaultCloseCallback() {
    PROMPT_QUEUE.shift();
    if (PROMPT_QUEUE.length) {
        PROMPT_QUEUE[0].activate();
        updateMoreIconDisplay();
    }
}

(function () {
    window.addEventListener("load", () => {
        PROMPT.id = "prompt-container";
        document.body.appendChild(PROMPT);

        PROMPT_MORE.className = "prompt-more";
        PROMPT_MORE.innerHTML = PROMPT_MORE_SVG;
        PROMPT.appendChild(PROMPT_MORE);

        MESSAGE_HANDLER(MESSAGE_TYPE.ShowDefaultPrompt, (event) => {
            if (
                event.detail?.config === undefined ||
                event.detail?.content === undefined
            ) {
                console.error(
                    "[ShowDefaultPrompt] get a unexpected event as",
                    event
                );
                return;
            }

            addPrompt(
                new PromptItem(
                    PROMPT,
                    event.detail.config.iconSvg,
                    event.detail.content,
                    event.detail.onclick
                        ? event.detail.onclick
                        : event.detail.config.onclick,
                    event.detail.closeCallback
                        ? event.detail.closeCallback
                        : event.detail.config.closeCallback,
                    defaultCloseCallback,
                    event.detail.config.color,
                    event.detail.timeout
                        ? event.detail.timeout
                        : event.detail.config.timeout
                )
            );
        });
    });
})();
