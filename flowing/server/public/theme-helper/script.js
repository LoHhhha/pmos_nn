// MESSAGE_TYPE.ThemeChange
//      change to <event.detail.theme> style.

const THEME_STYLE = {
    auto: "auto",
    light: "light",
    dark: "dark",
};

const THEME_ELEMENT = document.createElement("div");
THEME_ELEMENT.id = "theme-helper";

const THEME_ICON = ICONS.theme;

(function () {
    window.addEventListener("load", () => {
        THEME_ELEMENT.style.display = "none";
        document.body.appendChild(THEME_ELEMENT);
    });

    const prefers =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

    function changToTheme(themeStyle) {
        // themeStyle is one of THEME_STYLE
        THEME_ELEMENT.className = themeStyle;
        const style = window.getComputedStyle(THEME_ELEMENT);

        for (const property in themeHelperNamespace.colorReplaceRule) {
            const needProperty =
                themeHelperNamespace.colorReplaceRule[property];
            document.documentElement.style.setProperty(
                property,
                style.getPropertyValue(needProperty)
            );
        }
        console.info("[ThemeHelper] witch theme to", themeStyle);
        MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
            config: PROMPT_CONFIG.INFO,
            iconSvg: THEME_ICON,
            content: `Switch to "${
                themeStyle.charAt(0).toUpperCase() + themeStyle.slice(1)
            }" theme.`,
            timeout: 1000,
        });
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

    window.addThemeHelper = (initTheme) => {
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

        if (initTheme) {
            MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, { theme: initTheme });
        }
    };
})();
