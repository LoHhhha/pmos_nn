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
        const linkElements = [];
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
            linkElements.push(linkEle);
        }

        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: `PMoS\t${PMoS_VERSION}`,
            text: I18N_STRINGS.help_page_text,
            elements: linkElements,
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
