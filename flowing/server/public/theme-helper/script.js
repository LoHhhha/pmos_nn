// MESSAGE_TYPE.ThemeChange
//      change to <event.detail.theme> style.

const THEME_STYLE = {
    auto: "auto",
    light: "light",
    dark: "dark",
};

(function () {
    const prefers =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    function changToTheme(themeStyle) {
        for (const property in themeHelperNamespace.colorReplaceRule) {
            const needProperty =
                themeHelperNamespace.colorReplaceRule[property];
            document.documentElement.style.setProperty(
                property,
                themeHelperNamespace.color[themeStyle][needProperty]
            );
        }
        console.log("[ThemeHelper] change theme to", themeStyle);
    }
    function autoChange() {
        if (!(window.matchMedia instanceof Function)) {
            changToTheme(THEME_STYLE.light);
        }
        const isDark = prefers?.matches;
        if (isDark) {
            changToTheme(THEME_STYLE.dark);
        } else {
            changToTheme(THEME_STYLE.light);
        }
    }
    window.addThemeHelper = () => {
        MESSAGE_HANDLER(MESSAGE_TYPE.ThemeChange, (event) => {
            const themeStyle = THEME_STYLE[event.detail.theme];
            if (themeStyle === undefined) {
                console.warn(
                    "[ThemeHelper] error theme as",
                    event.detail.theme
                );
                return;
            }

            if (themeStyle === THEME_STYLE.auto) {
                autoChange();
                prefers.addEventListener("change", autoChange);
                return;
            }
            prefers.removeEventListener("change", autoChange);
            changToTheme(themeStyle);
        });

        MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, { theme: THEME_STYLE.auto });
    };
})();
