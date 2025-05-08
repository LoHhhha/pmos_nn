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
        for (const { title, url } of LINKS) {
            const linkEle = document.createElement("a");
            linkEle.innerHTML = title;
            linkEle.href = url;
            linkEle.target = "_blank";
            linkElements.push(linkEle);
        }

        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: `PMoS\t${PMoS_VERSION}`,
            text: "Have a good time :)<br>Learn more about PMoS at the follow links.<br>What's more, welcome to report any issue to us!",
            elements: linkElements,
            buttonMode: COVERING_BUTTON_MODE.CloseButton,
        });
    });

    MESSAGE_HANDLER(MESSAGE_TYPE.ClearGraphPage, (event) => {
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: event.detail?.title || "Clear all node?",
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
        inputEle.value = "New-Graph";
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: event.detail?.title || "Save as",
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
            title: event.detail?.title || "Restart PMoS?",
            text: "All unsaved changes will be lost!",
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
