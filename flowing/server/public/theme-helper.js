/**
 * MESSAGE_TYPE.ThemeChange
 *      change to <event.detail.theme> style
 *      [<event.detail.quiet>]
 *
 * MESSAGE_TYPE.ThemeCurrent -> THEME_STYLE.xx
 */

const THEME_STYLE = {
    auto: "auto",
    light: "light",
    dark: "dark",
};
const THEME_STYLE_NAME = {
    get auto() {
        return I18N_STRINGS.auto_theme;
    },
    get light() {
        return I18N_STRINGS.light_theme;
    },
    get dark() {
        return I18N_STRINGS.dark_theme;
    },
};

const THEME_COLOR_REPLACE_RULE = {
    "--container-outline-color": "--lucency-level-13-color",
    "--content-outline-color": "--lucency-level-11-color",
    "--sub-content-outline-color": "--lucency-level-9-color",
    "--container-background-color": "--lucency-level-3-color",
    "--content-background-color": "--lucency-level-5-color",
    "--sub-content-background-color": "--lucency-level-6-color",
    "--viewport-background-color": "--level-2-color",
    "--default-color": "--level-14-color",
    "--disabled-color": "--level-9-color",
};

const THEME_ELEMENT = document.createElement("div");
THEME_ELEMENT.id = "theme-helper";

let CURRENT_THEME;

const THEME_ICON = ICONS.theme;

(function () {
    window.addEventListener("load", () => {
        THEME_ELEMENT.style.display = "none";
        document.body.appendChild(THEME_ELEMENT);
    });

    const prefers =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

    function changToTheme(themeStyle, quiet) {
        // themeStyle is one of THEME_STYLE
        THEME_ELEMENT.className = themeStyle;
        const style = window.getComputedStyle(THEME_ELEMENT);

        for (const property in THEME_COLOR_REPLACE_RULE) {
            const needProperty = THEME_COLOR_REPLACE_RULE[property];
            document.documentElement.style.setProperty(
                property,
                style.getPropertyValue(needProperty)
            );
        }
        console.info("[ThemeHelper] witch theme to", themeStyle);
        if (!quiet) {
            MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
                config: PROMPT_CONFIG.INFO,
                iconSvg: THEME_ICON,
                content: I18N_STRINGS.theme_switch_format?.format(
                    THEME_STYLE_NAME[themeStyle]
                ),
                timeout: 1000,
            });
        }
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
            const themeStyle = event.detail?.theme;
            if (themeStyle === undefined) {
                console.warn(
                    "[ThemeHelper] error theme as",
                    event.detail?.theme
                );
                return;
            }

            SAVE_TO_LOCAL(MEMORY_KEYS.ThemeSetting, themeStyle);
            CURRENT_THEME = themeStyle;

            if (themeStyle === THEME_STYLE.auto) {
                autoChange();
                prefers.addEventListener("change", autoChange);
                return;
            }
            prefers.removeEventListener("change", autoChange);
            changToTheme(themeStyle, event.detail?.quiet);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.ThemeCurrent, () => CURRENT_THEME);

        if (!initTheme) {
            initTheme = READ_FROM_LOCAL(
                MEMORY_KEYS.ThemeSetting,
                THEME_STYLE.auto
            );
        }
        MESSAGE_PUSH(MESSAGE_TYPE.ThemeChange, {
            theme: initTheme,
            quiet: true,
        });

        window.addThemeHelper = () => {
            console.warn(
                "[ThemeHelper] calling addThemeHelper more than once is useless!"
            );
        };
    };
})();
