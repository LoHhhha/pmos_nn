/**
 * MESSAGE_TYPE.LLMCodeGenerator
 *      <event.detail.codeType?:codeTypes>
 *
 */

const codeTypes = ["pytorch", "tensorflow"];

class CodeGenerator {
    codeType;
    baseUrlInputEle;
    apiKeyInputEle;
    moduleInputEle;
    promptInputEle;
    queryInputEle;
    inputMask;
    sendButton;
    sendButtonType;
    #sendAbortController;
    thinkingAnswerEle;
    answerEle;
    errorMessageEle;
    copyButton;
    copyButtonType;
    block;

    finallyCode;

    static inputMasks = {
        baseUrl: 1 << 0,
        apiKey: 1 << 1,
        module: 1 << 2,
        prompt: 1 << 3,
        query: 1 << 4,
        default: (1 << 5) - 1,
    };
    sendButtonTypeConfig = {
        waitingParam: {
            id: "generator-button-default",
            text: "Please enter the required parameters firstly and continue!",
        },
        loading: {
            id: "generator-button-default",
            text: "Loading",
        },
        sendReady: {
            id: "generator-button-confirm",
            text: "Send",
            onclick: () => {
                const baseUrl = this.baseUrlInputEle.value;
                const apiKey = this.apiKeyInputEle.value;
                const module = this.moduleInputEle.value;
                const prompt = this.promptInputEle.value;
                const query = this.queryInputEle.value;
                if (!baseUrl || !apiKey || !module || !prompt || !query) {
                    console.error(
                        "[CodeGenerator] Send button is being clicked but params was lacking!"
                    );
                    return;
                }
                this.#setSendButton(this.sendButtonTypeConfig.loading);
                this.#chat(baseUrl, apiKey, module, prompt, query);
            },
        },
        stopReady: {
            id: "generator-button-cancel",
            text: "Stop",
            onclick: () => {
                try {
                    this.#sendAbortController.abort();
                } catch (error) {}
            },
        },
    };
    copyButtonTypeConfig = {
        copyReady: {
            display: "initial",
            id: "generator-button-confirm",
            text: "Copy Code to Clipboard",
            onclick: () => {
                navigator.clipboard.writeText(this.finallyCode);

                this.copyButton.textContent = "Copied!";
                if (this.copyButton.timeoutId) {
                    clearTimeout(this.copyButton.timeoutId);
                    this.copyButton.timeoutId = null;
                }

                this.copyButton.timeoutId = setTimeout(() => {
                    this.copyButton.textContent =
                        this.copyButtonTypeConfig.copyReady.text;
                }, 1000);
            },
        },
        notCode: {
            display: "initial",
            id: "generator-button-default",
            text: "No code detected, please try again.",
        },
        errorCode: {
            display: "initial",
            id: "generator-button-default",
            // text: undefined, // set outside
        },
        tooMuchCode: {
            display: "initial",
            id: "generator-button-default",
            text: "Too much code detected, please choice one by yourself.",
        },
        hide: {
            display: "none",
        },
    };

    constructor(codeType) {
        this.codeType = codeType;

        this.block = document.createElement("div");
        this.block.classList.add("generator-block");

        this.#initElements();
    }

    #createInputElement(config) {
        const {
            title,
            placeholder,
            parent,
            inputType,
            autoHeight,
            flex,
            inputId,
            inputMaskId,
            datalistId,
        } = {
            inputType: "input",
            parent: this.block,
            ...config,
        };
        const comboEle = document.createElement("div");
        comboEle.classList.add("generator-combo-column");
        if (title) {
            const titleEle = document.createElement("div");
            titleEle.classList.add("generator-input-title");
            titleEle.textContent = title;
            comboEle.appendChild(titleEle);
        }
        const inputEle = document.createElement(inputType);
        inputEle.classList.add("generator-input");
        if (inputId) {
            inputEle.id = inputId;
        }
        if (placeholder) {
            inputEle.placeholder = placeholder;
        }
        if (autoHeight) {
            inputEle.addEventListener("input", () => {
                inputEle.style.height = "auto";
                inputEle.style.height = inputEle.scrollHeight + "px";
            });
        }
        if (inputMaskId) {
            inputEle.addEventListener("input", () => {
                this.inputMask |= inputMaskId;
                if (inputEle.value) {
                    this.inputMask = this.inputMask ^ inputMaskId;
                }

                this.#updateSendButton();
            });
        }
        if (datalistId) {
            inputEle.setAttribute("list", datalistId);
        }
        comboEle.appendChild(inputEle);
        if (flex) {
            comboEle.style.flex = flex;
        }
        if (parent) {
            parent.appendChild(comboEle);
        }
        return inputEle;
    }

    #initInputElements() {
        const configComboEle = document.createElement("div");
        configComboEle.classList.add("generator-combo-row");

        this.inputMask = CodeGenerator.inputMasks.default;

        this.baseUrlInputEle = this.#createInputElement({
            title: "Base URL",
            placeholder: "http://xxx.chat.ai",
            flex: 2,
            parent: configComboEle,
            inputMaskId: CodeGenerator.inputMasks.baseUrl,
            datalistId: LLMCodeGeneratorNamespace.baseUrlsDatalistInfo.id,
        });

        const apiKeyInputEle = this.#createInputElement({
            title: "Api Key",
            placeholder: "api-authentication-key",
            flex: 2,
            parent: configComboEle,
            inputMaskId: CodeGenerator.inputMasks.apiKey,
        });
        apiKeyInputEle.type = "password";
        apiKeyInputEle.autocomplete = "on";
        this.apiKeyInputEle = apiKeyInputEle;

        this.moduleInputEle = this.#createInputElement({
            title: "Module",
            placeholder: "module-name",
            flex: 1,
            parent: configComboEle,
            inputMaskId: CodeGenerator.inputMasks.module,
            datalistId: LLMCodeGeneratorNamespace.modulesDatalistInfo.id,
        });

        this.block.append(configComboEle);

        this.promptInputEle = this.#createInputElement({
            title: "Prompt",
            placeholder: "Enter your prompt in here.",
            inputType: "textarea",
            inputId: "generator-input-prompt",
            inputMaskId: CodeGenerator.inputMasks.prompt,
        });

        this.promptInputEle.textContent = LLMCodeGeneratorNamespace.prompt;
        this.promptInputEle.dispatchEvent(
            new Event("input", { bubbles: true })
        );

        this.queryInputEle = this.#createInputElement({
            title: "Query",
            placeholder: "Enter what you want in here.",
            inputType: "textarea",
            autoHeight: true,
            inputId: "generator-input-query",
            inputMaskId: CodeGenerator.inputMasks.query,
        });
    }

    #updateSendButton() {
        if (this.inputMask === 0) {
            if (
                this.sendButtonType === this.sendButtonTypeConfig.waitingParam
            ) {
                this.#setSendButton(this.sendButtonTypeConfig.sendReady);
            }
        } else if (
            this.sendButtonType === this.sendButtonTypeConfig.sendReady
        ) {
            this.#setSendButton(this.sendButtonTypeConfig.waitingParam);
        }
    }

    #setSendButton(type) {
        this.sendButton.id = type.id;
        this.sendButton.onclick = type.onclick;
        this.sendButton.textContent = type.text;
        this.sendButtonType = type;
    }

    #initSendButtonElements() {
        const sendButton = document.createElement("button");
        sendButton.classList.add("generator-button");

        this.sendButton = sendButton;
        this.#setSendButton(this.sendButtonTypeConfig.waitingParam);
        this.block.appendChild(sendButton);
    }

    #initMessageElements() {
        const thinkingAnswerEle = document.createElement("div");
        thinkingAnswerEle.classList.add("generator-answer-block");
        const answerEle = document.createElement("div");
        answerEle.classList.add("generator-answer-block");
        const errorMessageEle = document.createElement("div");
        errorMessageEle.classList.add("generator-error-message-block");

        this.thinkingAnswerEle = thinkingAnswerEle;
        this.answerEle = answerEle;
        this.errorMessageEle = errorMessageEle;

        this.#clearAnswer();
        this.#clearErrorMessage();

        this.block.append(thinkingAnswerEle);
        this.block.append(answerEle);
        this.block.append(errorMessageEle);
    }

    #clearAnswer() {
        this.thinkingAnswerEle.innerHTML = "";
        this.answerEle.innerHTML = "";

        this.thinkingAnswerEle.style.display = "none";
        this.answerEle.style.display = "none";

        this.thinkingAnswerEle.style.whiteSpace = "pre-wrap";
        this.answerEle.style.whiteSpace = "pre-wrap";
    }

    #addAnswer(content, isThinking) {
        if (content === "") return;
        if (isThinking) {
            this.thinkingAnswerEle.style.display = "initial";
            this.thinkingAnswerEle.textContent += content;
        } else {
            this.answerEle.style.display = "initial";
            this.answerEle.textContent += content;
        }
    }

    #checkAnswer() {
        const content = this.answerEle.textContent;
        const codes = content.match(LLMCodeGeneratorNamespace.blockReg);

        if (codes === null || !codes instanceof Array || codes.length === 0) {
            this.#setCopyButton(this.copyButtonTypeConfig.notCode);
            return;
        }

        if (codes.length > 1) {
            this.#setCopyButton(this.copyButtonTypeConfig.tooMuchCode);
            return;
        }

        const code = codes[0];
        const result = MESSAGE_CALL(MESSAGE_TYPE.CheckImportGraph, {
            data: code,
        });

        if (result.length === 0) {
            console.error(
                "[CodeGenerator] MESSAGE_TYPE.CheckImportGraph return nothing!"
            );
            return;
        }

        const error = result[0];
        if (error) {
            this.#setCopyButton(
                this.copyButtonTypeConfig.errorCode,
                `Code invalid: ${error}`
            );
            return;
        }

        this.finallyCode = codes;
        this.#setCopyButton(this.copyButtonTypeConfig.copyReady);
    }

    #buildAnswer(isThinking) {
        let content = isThinking
            ? this.thinkingAnswerEle.textContent.substr()
            : this.answerEle.textContent.substr();
        if (content === "") return;
        if (isThinking) {
            this.thinkingAnswerEle.style.whiteSpace = "normal";

            content = ">" + content.split("\n").join("\n>");
            this.thinkingAnswerEle.innerHTML = marked.parse(content);
        } else {
            this.answerEle.style.whiteSpace = "normal";

            this.answerEle.innerHTML = marked.parse(content);
        }
    }

    #clearErrorMessage() {
        this.errorMessageEle.style.display = "none";
        this.errorMessageEle.textContent = "";
    }

    #addErrorMessage(content) {
        if (content === "") {
            return;
        }
        this.errorMessageEle.style.display = "initial";
        if (this.errorMessageEle.textContent) {
            this.errorMessageEle.textContent += "\n";
        }
        this.errorMessageEle.textContent += content;
    }

    #setCopyButton(type, text) {
        this.copyButton.id = type.id;
        this.copyButton.onclick = type.onclick;
        this.copyButton.textContent = text ? text : type.text;
        this.copyButton.style.display = type.display;
        this.copyButtonType = type;
    }

    #initCopyButtonElements() {
        const copyButton = document.createElement("button");
        copyButton.classList.add("generator-button");

        this.copyButton = copyButton;
        this.#setCopyButton(this.copyButtonTypeConfig.hide);
        this.block.appendChild(copyButton);
    }

    #initElements() {
        this.#initInputElements();
        this.#initSendButtonElements();
        this.#initMessageElements();
        this.#initCopyButtonElements();
    }

    async #chat(baseUrl, apiKey, module, prompt, query) {
        this.#sendAbortController = new AbortController();
        const requestBody = {
            model: module,
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: query },
            ],
            stream: true,
        };

        this.#clearAnswer();
        this.#clearErrorMessage();
        this.#setSendButton(this.sendButtonTypeConfig.stopReady);
        this.#setCopyButton(this.copyButtonTypeConfig.hide);

        try {
            const response = await fetch(baseUrl, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
                signal: this.#sendAbortController.signal,
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let thinkingIsEnd = false;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk
                    .split("\n")
                    .filter((line) => line.trim() !== "");

                for (const line of lines) {
                    const message = line.replace(/^data: /, "");
                    if (message === "[DONE]") break;

                    try {
                        const parsed = JSON.parse(message);

                        const delta = parsed.choices[0].delta;

                        let thinkingContent = delta?.reasoning_content || "";
                        let content = delta?.content || "";

                        if (thinkingContent === "" && content === "") {
                            continue;
                        }

                        if (thinkingContent === "") {
                            if (!thinkingIsEnd) {
                                thinkingIsEnd = true;
                                this.#buildAnswer(true);
                            }
                        } else if (thinkingIsEnd) {
                            console.warn(
                                "[CodeGenerator] More than one thinking content, dropped!"
                            );
                            thinkingContent = "";
                        }

                        this.#addAnswer(thinkingContent, true);
                        this.#addAnswer(content);
                    } catch (error) {
                        console.error(
                            "[CodeGenerator] JSON parse error!",
                            requestBody,
                            error
                        );
                        this.#addErrorMessage(
                            "Unexpect package, please check if 'ApiKey' is correct and 'Module' existed!"
                        );
                    }
                }
            }
            this.#checkAnswer();
            this.#buildAnswer();
        } catch (error) {
            if (error.name === "AbortError") {
                console.info("[CodeGenerator] Request canceled.", requestBody);
                this.#addErrorMessage("Request cancel!");
            } else {
                console.error(
                    "[CodeGenerator] Request error!",
                    requestBody,
                    error
                );
                this.#addErrorMessage(
                    "Request failed, please check if 'BaseURL' is correct!"
                );
            }
        } finally {
            this.#setSendButton(this.sendButtonTypeConfig.sendReady);
        }
    }

    show() {
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShowCustom, {
            title: "Generation",
            elements: [this.block],
            buttonMode: COVERING_BUTTON_MODE.CloseButton,
            buttonCallback: {
                close: this.sendButtonTypeConfig.stopReady.onclick,
            },
            init: () => {
                this.queryInputEle.focus();
            },
        });
    }
}

function showGeneratorMenu(codeType) {
    new CodeGenerator(codeType).show();
}

(function () {
    window.addLLMCodeGenerator = () => {
        // create baseUrl datalist
        const baseUrlsDatalist = document.createElement("datalist");
        baseUrlsDatalist.id = LLMCodeGeneratorNamespace.baseUrlsDatalistInfo.id;
        for (const item of LLMCodeGeneratorNamespace.baseUrlsDatalistInfo
            .values) {
            const itemEle = document.createElement("option");
            itemEle.value = item;
            baseUrlsDatalist.appendChild(itemEle);
        }
        document.body.appendChild(baseUrlsDatalist);

        // create module datalist
        const modulesDatalist = document.createElement("datalist");
        modulesDatalist.id = LLMCodeGeneratorNamespace.modulesDatalistInfo.id;
        for (const item of LLMCodeGeneratorNamespace.modulesDatalistInfo
            .values) {
            const itemEle = document.createElement("option");
            itemEle.value = item;
            modulesDatalist.appendChild(itemEle);
        }
        document.body.appendChild(modulesDatalist);

        MESSAGE_HANDLER(MESSAGE_TYPE.LLMCodeGenerator, (event) => {
            const codeType = codeTypes.includes(event.detail?.codeType)
                ? event.detail?.codeType
                : codeTypes[0];
            showGeneratorMenu(codeType);
        });
    };
})();
