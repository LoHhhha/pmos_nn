/**
 * MESSAGE_TYPE.ChangeLanguage
 *      <event.detail.language>
 *
 * MESSAGE_TYPE.LanguageChanged
 *      <event.detail.language>
 *      [<event.detail.quiet>]
 *      if elements always existed, using this to change it's text.
 *      otherwise, using I18n_STRINGS.
 *
 * MESSAGE_TYPE.LanguageCurrent
 *      <event.detail.language>
 */

const LANGUAGES = {
    english: "en",
    chinese: "cn",
};

const LANGUAGE_NAME = {
    en: LANGUAGE_DATA.english.en,
    cn: LANGUAGE_DATA.chinese.cn,
};

let CURRENT_LANGUAGE;
const LANGUAGE_ICON = ICONS.language;

// using I18N_STRINGS.key or I18N_STRINGS["key"]
const I18N_STRINGS = new Proxy(
    {},
    {
        get(_, key, __) {
            const ret = LANGUAGE_DATA[key]?.[CURRENT_LANGUAGE];
            if (ret === undefined) {
                for (const [_, language] of Object.entries(LANGUAGES)) {
                    if (LANGUAGE_DATA[key]?.[language]) {
                        return LANGUAGE_DATA[key]?.[language];
                    }
                }
                console.warn(`[I18n] not content of ${key}`);
                return undefined;
            }
            return ret;
        },
    }
);

function changeToLanguage(language, quiet) {
    CURRENT_LANGUAGE = language;
    MESSAGE_CALL(MESSAGE_TYPE.LanguageChanged, {
        language: CURRENT_LANGUAGE,
    });
    console.info("[I18n] change to language", language);
    if (!quiet) {
        MESSAGE_PUSH(MESSAGE_TYPE.PromptShow, {
            config: PROMPT_CONFIG.INFO,
            iconSvg: LANGUAGE_ICON,
            content: I18N_STRINGS.language_switch_format?.format(
                LANGUAGE_NAME[`${language}`]
            ),
            timeout: 1000,
        });
    }
}

(function () {
    window.addI18n = (initLanguage) => {
        // format support
        String.prototype.format = function () {
            const args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != "undefined"
                    ? args[number]
                    : match;
            });
        };

        MESSAGE_HANDLER(MESSAGE_TYPE.ChangeLanguage, (event) => {
            const language = event.detail?.language;
            if (language === undefined) {
                console.warn(
                    "[I18n] error language as",
                    event.detail?.language
                );
                return;
            }
            changeToLanguage(language, event.detail?.quiet);

            SAVE_TO_LOCAL(MEMORY_KEYS.LanguageSetting, language);
        });

        MESSAGE_HANDLER(MESSAGE_TYPE.LanguageCurrent, () => CURRENT_LANGUAGE);

        if (!initLanguage) {
            initLanguage = READ_FROM_LOCAL(
                MEMORY_KEYS.LanguageSetting,
                LANGUAGES.english
            );
        }
        MESSAGE_CALL(MESSAGE_TYPE.ChangeLanguage, {
            language: initLanguage,
            quiet: true,
        });

        window.addI18n = () => {
            console.warn("[I18n] calling addI18n more than once is useless!");
        };
    };
})();
