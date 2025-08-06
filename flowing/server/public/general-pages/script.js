/**
 * MESSAGE_TYPE.HelpPage
 *
 * MESSAGE_TYPE.ClearGraphPage
 *
 * MESSAGE_TYPE.SaveAsPage
 *
 * MESSAGE_TYPE.RestartPage
 */

(function () {
    MESSAGE_HANDLER(MESSAGE_TYPE.HelpPage, () => {
        const helpContainerEle = document.createElement("div");
        helpContainerEle.classList.add("general-pages-container");
        helpContainerEle.classList.add("general-pages-help-container");

        const packageReadyContainerEle = document.createElement("div");
        packageReadyContainerEle.classList.add("general-pages-container");
        packageReadyContainerEle.classList.add("general-pages-help-container");
        for (const { packageName, ready } of [
            {
                packageName: "PyTorch",
                ready: BACKEND_TORCH_READY,
            },
            {
                packageName: "MindSpore",
                ready: BACKEND_MIND_SPORE_READY,
            },
            {
                packageName: "TensorFlow",
                ready: BACKEND_TENSOR_FLOW_READY,
            },
        ]) {
            const supportEle = document.createElement("div");
            supportEle.classList.add("general-pages-help-pair");

            const packageEle = document.createElement("div");
            packageEle.classList.add("general-pages-help-title");
            packageEle.textContent = packageName;
            supportEle.appendChild(packageEle);

            const infoEle = document.createElement("div");
            infoEle.classList.add("general-pages-help-info");
            if (ready) {
                infoEle.classList.add(
                    "general-pages-help-package-support-ready"
                );
                infoEle.textContent = I18N_STRINGS.ready;
            } else {
                infoEle.classList.add(
                    "general-pages-help-package-support-not-ready"
                );
                infoEle.textContent = I18N_STRINGS.limited;
            }
            supportEle.appendChild(infoEle);

            packageReadyContainerEle.appendChild(supportEle);
        }
        helpContainerEle.appendChild(packageReadyContainerEle);

        const linkContainerEle = document.createElement("div");
        linkContainerEle.classList.add("general-pages-container");
        for (const { title, url } of [
            {
                title: I18N_STRINGS.instruction,
                url: PMoS_FLOWING_INSTRUCTION_HREF,
            },
            {
                title: `PMoS-nn ${I18N_STRINGS.code_repository}`,
                url: PMoS_REP_HREF,
            },
            {
                title: `JsPlumb ${I18N_STRINGS.code_repository}`,
                url: JS_PLUMB_REP_HREF,
            },
            {
                title: `Marked ${I18N_STRINGS.code_repository}`,
                url: MARKED_REP_HREF,
            },
        ]) {
            const linkEle = document.createElement("a");
            linkEle.innerHTML = title;
            linkEle.href = url;
            linkEle.target = "_blank";
            linkContainerEle.appendChild(linkEle);
        }
        helpContainerEle.appendChild(linkContainerEle);

        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: `PMoS ${PMoS_VERSION}`,
            text: I18N_STRINGS.help_page_text,
            elements: [helpContainerEle],
            buttonMode: COVERING_BUTTON_MODE.CloseButton,
        });
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.ClearGraphPage, (event) => {
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: event.detail?.title || I18N_STRINGS.clear_all_node_confirm,
            buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
            buttonCallback: {
                beforeConfirm: () => {
                    MESSAGE_CALL(MESSAGE_TYPE.ClearNodes);
                },
            },
        });
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.SaveAsPage, (event) => {
        const inputEle = document.createElement("input");
        inputEle.className = "general-pages-input";
        inputEle.value = I18N_STRINGS.new_graph;
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: event.detail?.title || I18N_STRINGS.save_as,
            elements: [inputEle],
            buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
            init: () => {
                inputEle.focus();
            },
            buttonCallback: {
                confirm: () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.SaveGraph, {
                        name: inputEle.value,
                        asNew: true,
                    });
                },
            },
        });
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.RestartPage, (event) => {
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: event.detail?.title || I18N_STRINGS.restart_confirm,
            text: I18N_STRINGS.unsaved_warning_text,
            buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
            buttonCallback: {
                beforeConfirm: () => {
                    MESSAGE_CALL(MESSAGE_TYPE.ResetCurrentSaveGraph);
                    MESSAGE_CALL(MESSAGE_TYPE.ClearNodes);
                    MESSAGE_CALL(MESSAGE_TYPE.OperationRecordReset);
                    MESSAGE_CALL(MESSAGE_TYPE.NavigatorBackToOrigin);
                    MESSAGE_CALL(MESSAGE_TYPE.NavigatorZoomTo100);
                },
            },
        });
    });
})();
