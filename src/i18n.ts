import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import cs from './assets/locales/messages.cs.json';

const resources = {
    cs
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "cs",
        keySeparator: false,
        debug: false,
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;