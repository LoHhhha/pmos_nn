/**
 * MESSAGE_TYPE.PromptShow
 *      <event.detail.config: PROMPT_CONFIG.xxx>
 *      <event.detail.content>
 *      [<event.detail.iconSvg: SVG-DOM>]
 *      [<event.detail.closeCallback: Func> return true will not close.]
 *      [<event.detail.onclick: Func>]
 *      [<event.detail.timeout>]
 *
 * MESSAGE_TYPE.PromptStop
 *
 * MESSAGE_TYPE.PromptStart
 */

const PROMPT_CONFIG = {
    INFO: {
        name: "prompt-info",
        iconSvg: ICONS.info,
        onclick: undefined,
        closeCallback: undefined,
        timeout: 5000,
        color: "var(--prompt-item-info-background-color)",
    },
    WARNING: {
        name: "prompt-warning",
        iconSvg: ICONS.warning,
        onclick: undefined,
        closeCallback: undefined,
        timeout: undefined,
        color: "var(--prompt-item-warning-background-color)",
    },
    ERROR: {
        name: "prompt-error",
        iconSvg: ICONS.error,
        onclick: (promptItem) => {
            MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
                title: "Error",
                text: promptItem.text,
                buttonMode: COVERING_BUTTON_MODE.CloseButton,
            });
            promptItem.dispose();
        },
        closeCallback: undefined,
        timeout: undefined,
        color: "var(--prompt-item-error-background-color)",
    },
};

const PROMPT = document.createElement("div");
const PROMPT_MORE = document.createElement("div");
const PROMPT_MORE_SVG = ICONS.more;
const PROMPT_QUEUE = new Array(0);

let PROMPT_STOPPING = false;

const PROMPT_FRAME_QUEUE_WEIGHT = CALL_QUEUE_AMOUNT - 1;

class PromptItem {
    icon;
    content;
    closeIcon;
    element;

    closeCallback;
    timeout;
    text;

    constructor(
        iconSvg,
        text,
        onclick = undefined,
        closeCallback = undefined,
        color = undefined,
        timeout = undefined
    ) {
        this.element = document.createElement("div");
        this.element.className = "prompt-item";

        this.progress = document.createElement("div");
        this.progress.className = "prompt-item-progress";

        this.icon = document.createElement("div");
        this.icon.className = "prompt-item-icon";
        this.icon.innerHTML = iconSvg;

        this.content = document.createElement("div");
        this.content.className = "prompt-item-content";
        this.content.textContent = text;

        this.closeIcon = document.createElement("div");
        this.closeIcon.className = "prompt-item-close";
        this.closeIcon.innerHTML = ICONS.cross;
        this.closeIcon.onclick = this.disposeFunc;

        this.element.appendChild(this.progress);
        this.element.appendChild(this.icon);
        this.element.appendChild(this.content);
        this.element.appendChild(this.closeIcon);

        if (color) {
            this.element.style.backgroundColor = color;
        }

        if (onclick) {
            this.content.onclick = onclick.bind(this, this);
            this.content.style.cursor = "pointer";
        }

        this.closeCallback = closeCallback;

        this.timeout = timeout;
        this.text = text;

        this.element.addEventListener("mouseenter", this.stopProgressFunc);
        this.element.addEventListener("mouseleave", this.startProgressFunc);
    }

    stopProgressFunc = this.stopProgress.bind(this);
    stopProgress() {
        this.progress.removeEventListener("transitionend", this.disposeFunc);
        CALL_BEFORE_NEXT_FRAME(PROMPT_FRAME_QUEUE_WEIGHT, () => {
            this.progress.style.transition = "none";
            this.progress.style.width = "0px";
        });
    }

    startProgressFunc = this.startProgress.bind(this);
    startProgress() {
        if (this.timeout === undefined) return;

        this.progress.addEventListener("transitionend", this.disposeFunc);
        CALL_BEFORE_NEXT_FRAME(PROMPT_FRAME_QUEUE_WEIGHT, () => {
            this.progress.style.transition = `width ${this.timeout}ms linear`;
            this.progress.style.width = "100%";
        });
    }

    activate() {
        if (PROMPT_STOPPING) return;

        PROMPT.appendChild(this.element);
        this.stopProgress();
        CALL_BEFORE_NEXT_FRAME(
            PROMPT_FRAME_QUEUE_WEIGHT,
            this.startProgressFunc
        );
    }

    isDispose = false;
    disposeFunc = this.dispose.bind(this);
    dispose() {
        if (!this.isDispose) {
            if (this.closeCallback instanceof Function) {
                if (this.closeCallback()) {
                    return;
                }
            }

            this.isDispose = true;
            this.stopProgress();
            this.element.remove();
            CALL_BEFORE_NEXT_FRAME(
                PROMPT_FRAME_QUEUE_WEIGHT,
                PromptItem.defaultCloseCallback
            );
        }
    }

    static stopCurrentPrompt() {
        if (PROMPT_QUEUE.length) {
            PROMPT_QUEUE.at(0).stopProgress();
        }
    }

    static showNextPrompt() {
        if (PROMPT_QUEUE.length) {
            PROMPT_QUEUE.at(0).activate();
            PromptItem.updatePromptMoreDisplay();
        }
    }

    static defaultCloseCallback() {
        PROMPT_QUEUE.shift();
        PromptItem.showNextPrompt();
    }

    static addPrompt(prompt) {
        if (!PROMPT_QUEUE.length && !PROMPT_STOPPING) {
            CALL_BEFORE_NEXT_FRAME(
                PROMPT_FRAME_QUEUE_WEIGHT,
                prompt.activate.bind(prompt)
            );
        }
        PROMPT_QUEUE.push(prompt);
        PromptItem.updatePromptMoreDisplay();
    }

    static updatePromptMoreDisplay() {
        let showText = "";
        // have prompts waiting
        if (PROMPT_QUEUE.length > 1) {
            showText = `${PROMPT_QUEUE.length - 1}+`;
        }

        if (showText !== "") {
            PROMPT_MORE.style.display = "inline";
            PROMPT_MORE.textContent = showText;
        } else {
            PROMPT_MORE.style.display = "none";
        }
    }
}

(function () {
    window.addEventListener("load", () => {
        PROMPT.id = "prompt-container";
        document.body.appendChild(PROMPT);

        PROMPT_MORE.className = "prompt-more";
        PROMPT_MORE.innerHTML = PROMPT_MORE_SVG;
        PROMPT.appendChild(PROMPT_MORE);

        MESSAGE_HANDLER(MESSAGE_TYPE.PromptShow, (event) => {
            if (
                event.detail?.config === undefined ||
                event.detail?.content === undefined
            ) {
                console.error("[PromptShow] get a unexpected event as", event);
                return;
            }

            PromptItem.addPrompt(
                new PromptItem(
                    event.detail.iconSvg
                        ? event.detail.iconSvg
                        : event.detail.config.iconSvg,
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

        MESSAGE_HANDLER(MESSAGE_TYPE.PromptStop, () => {
            PROMPT_STOPPING = true;
            PROMPT.style.display = "none";
            PromptItem.stopCurrentPrompt();
            console.info("[PromptStop] prompt stopped");
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.PromptStart, () => {
            PROMPT_STOPPING = false;
            PROMPT.style.display = "grid";
            PromptItem.showNextPrompt();
            console.info("[PromptStart] prompt started");
        });
    });
})();
