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

    MESSAGE_HANDLER(MESSAGE_TYPE.ClearGraphPage, () => {
        MESSAGE_PUSH(MESSAGE_TYPE.CoveringShow, {
            title: "Clear all node?",
            buttonMode: COVERING_BUTTON_MODE.ConfirmAndCancelButton,
            buttonCallback: {
                confirm: () => {
                    MESSAGE_PUSH(MESSAGE_TYPE.ClearNodes);
                },
            },
        });
    });
})();
