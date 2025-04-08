/**
 *  ENTER_NEW_KEY_NAMESPACE(namespace:string)
 *  ADD_KEY_HANDLER(namespace:string, keyCode:string, modifierKeyCodes:Array<MODIFIER_KEY_CODE.x>, callback) -> key
 *      callback return true to stop, and last-in first-do
 *  DELETE_KEY_HANDLER(namespace:string, key:string, callback)
 *  EXIT_KEY_NAMESPACE(namespace:string)
 */
const KEY_CALLBACK_BAG = new Array(); // Array[{namespace:String,callbackMap:Map<key:String,callbacks:Array[callback]>}]
const KEY_HELPER_IGNORE_ELEMENTS = [
    "button",
    "checkbox",
    "radio",
    "file",
    "submit",
    "input",
    "text",
    "textarea",
];
const MODIFIER_KEY_CODE = {
    alt: {
        key: "altKey",
        bit: 0,
    },
    ctrl: {
        key: "ctrlKey",
        bit: 1,
    },
    meta: {
        key: "metaKey",
        bit: 2,
    },
    shift: {
        key: "shiftKey",
        bit: 3,
    },
};
const DEFAULT_KEY_NAMESPACE = "MAIN";

const ENTER_NEW_KEY_NAMESPACE = (namespace) => {
    KEY_CALLBACK_BAG.push({
        namespace: namespace,
        callbackMap: new Map(),
    });
    console.info(`[KeyHelper] enter namespace ${namespace}`);
};

const EXIT_KEY_NAMESPACE = (namespace) => {
    if (KEY_CALLBACK_BAG.at(-1).namespace !== namespace) {
        console.error(
            `[KeyHelper] not such namespace(${namespace}) in the back!`
        );
        return;
    }
    KEY_CALLBACK_BAG.pop();
    console.info(
        `[KeyHelper] exit namespace ${namespace} and enter namespace ${
            KEY_CALLBACK_BAG.at(-1).namespace
        }`
    );
};

const _GET_KEY_NAMESPACE_CALLBACK_MAP = (namespace) => {
    for (const { curNamespace, callbackMap } of KEY_CALLBACK_BAG) {
        if (curNamespace === namespace) {
            return callbackMap;
        }
    }
    console.error(`[KeyHelper] not such namespace(${namespace})!`);
    return null;
};

const _GET_KEY_FROM_KEY_CODE_AND_MODIFIER_KEY_BITS = (
    keyCode,
    modifierKeyBits
) => {
    return `${keyCode}-${modifierKeyBits}`;
};

const _GET_MODIFIER_KEY_BITS_FROM_MODIFIER_KEY_CODES = (modifierKeyCodes) => {
    let modifierKeyBits = 0;
    for (const { bit } of modifierKeyCodes) {
        modifierKeyBits |= 1 << bit;
    }
    return modifierKeyBits;
};

const _GET_MODIFIER_KEY_BITS_FROM_KEY_EVENT = (event) => {
    let modifierKeyBits = 0;
    for (const [_, info] of Object.entries(MODIFIER_KEY_CODE)) {
        modifierKeyBits |= (event[info.key] ? 1 : 0) << info.bit;
    }
    return modifierKeyBits;
};

const ADD_KEY_HANDLER = (namespace, keyCode, modifierKeyCodes, callback) => {
    let callbackMap = KEY_CALLBACK_BAG.at(-1).callbackMap;
    if (KEY_CALLBACK_BAG.at(-1).namespace !== namespace) {
        console.warn(`[KeyHelper] namespace(${namespace}) not in the back!`);
        callbackMap = _GET_KEY_NAMESPACE_CALLBACK_MAP(namespace);
    }

    if (callbackMap === null) {
        console.error(`[KeyHelper] namespace(${namespace}) not found!`);
        return;
    }

    const key = _GET_KEY_FROM_KEY_CODE_AND_MODIFIER_KEY_BITS(
        keyCode,
        _GET_MODIFIER_KEY_BITS_FROM_MODIFIER_KEY_CODES(modifierKeyCodes)
    );

    let callbacks = callbackMap.get(key);
    if (callbacks === undefined) {
        callbacks = new Array();
        callbackMap.set(key, callbacks);
    }

    callbacks.push(callback);

    return key;
};

const DELETE_KEY_HANDLER = (namespace, key, callback) => {
    let callbackMap = KEY_CALLBACK_BAG.at(-1).callbackMap;
    if (KEY_CALLBACK_BAG.at(-1).namespace !== namespace) {
        console.warn(`[KeyHelper] namespace(${namespace}) not in the back!`);
        callbackMap = _GET_KEY_NAMESPACE_CALLBACK_MAP(namespace);
    }

    if (callbackMap === null) {
        console.error(`[KeyHelper] namespace(${namespace}) not found!`);
        return;
    }

    let callbacks = callbackMap.get(key);
    if (callbacks === undefined) {
        console.warn(
            `[KeyHelper] namespace(${namespace})-key(${key}) not found!`
        );
        return;
    }

    callbackMap.set(
        key,
        callbacks.filter((item) => {
            return item !== callback;
        })
    );
};

(function () {
    window.addEventListener("load", () => {
        ENTER_NEW_KEY_NAMESPACE(DEFAULT_KEY_NAMESPACE);

        // disable default ctrl+'X'
        window.document.addEventListener("keydown", function (event) {
            if (!event.ctrlKey) return;
            const focusedElement = document.activeElement;
            if (KEY_HELPER_IGNORE_ELEMENTS.includes(focusedElement?.type)) {
                return;
            }
            event.preventDefault();
        });

        window.addEventListener("keyup", (event) => {
            const focusedElement = document.activeElement;
            if (KEY_HELPER_IGNORE_ELEMENTS.includes(focusedElement?.type)) {
                return;
            }

            const callbackMap = KEY_CALLBACK_BAG.at(-1).callbackMap;

            const key = _GET_KEY_FROM_KEY_CODE_AND_MODIFIER_KEY_BITS(
                event.key,
                _GET_MODIFIER_KEY_BITS_FROM_KEY_EVENT(event)
            );

            const callbacks = callbackMap.get(key);
            if (callbacks === undefined) {
                return;
            }

            const callbackAmount = callbacks.length;
            for (let idx = callbackAmount - 1; idx >= 0; idx--) {
                callbacks.at(idx)();
            }
        });
    });
})();
