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
        onclick: undefined,
        closeCallback: undefined,
        timeout: 5000,
        // color: rootStyle.var("--prompt-item-info-background-color"),
    },
    WARNING: {
        name: "prompt-warning",
        iconSvg: ICONS.warning,
        onclick: undefined,
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
    closeIcon;
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

        this.closeIcon = document.createElement("div");
        this.closeIcon.className = "prompt-item-close";
        this.closeIcon.innerHTML = ICONS.cross;
        this.closeIcon.onclick = this.dispose.bind(this);

        this.element.appendChild(this.icon);
        this.element.appendChild(this.content);
        this.element.appendChild(this.closeIcon);

        if (color) {
            this.element.style.backgroundColor = color;
        }

        if (onclick) {
            this.content.onclick = onclick.bind(this);
            this.content.style.cursor = "pointer";
        }

        this.container = container;
        this.closeCallback = closeCallback;

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
            PromptItem.defaultCloseCallback();
        }
    }

    static defaultCloseCallback() {
        PROMPT_QUEUE.shift();
        if (PROMPT_QUEUE.length) {
            PROMPT_QUEUE[0].activate();
            updatePromptMoreDisplay();
        }
    }
}

function updatePromptMoreDisplay() {
    let showText = "";
    const addText = (text) => {
        if (showText === "") {
            showText += text;
        } else {
            showText += `\n${text}`;
        }
    };

    // have prompts waiting
    if (PROMPT_QUEUE.length > 1) {
        addText(`${PROMPT_QUEUE.length - 1}+`);
    }

    // this prompts will not timeout
    if (PROMPT_QUEUE.length >= 1 && PROMPT_QUEUE[0].timeout === undefined) {
        addText("Attention!");
    }

    if (showText !== "") {
        PROMPT_MORE.style.display = "inline";
        PROMPT_MORE.textContent = showText;
    } else {
        PROMPT_MORE.style.display = "none";
    }
}

function addPrompt(prompt) {
    if (!PROMPT_QUEUE.length) {
        prompt.activate();
    }
    PROMPT_QUEUE.push(prompt);
    updatePromptMoreDisplay();
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
                    event.detail.config.color,
                    event.detail.timeout
                        ? event.detail.timeout
                        : event.detail.config.timeout
                )
            );
        });
    });
})();
