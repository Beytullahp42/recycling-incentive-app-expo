import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./locales/en.json";
import translationEs from "./locales/es.json";
import translationTr from "./locales/tr.json";

const resources = {
  en: { translation: translationEn },
  tr: { translation: translationTr },
  es: { translation: translationEs },
};

export const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    const deviceLang = Localization.getLocales()[0]?.languageCode; // "en", "tr", "es"
    savedLanguage =
      deviceLang && resources[deviceLang as keyof typeof resources]
        ? deviceLang
        : "en";
  }

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
};

export const setLanguage = async (langCode: string | null) => {
  if (langCode) {
    await AsyncStorage.setItem("language", langCode);
    await i18n.changeLanguage(langCode);
  } else {
    await AsyncStorage.removeItem("language");
    const deviceLang = Localization.getLocales()[0]?.languageCode;
    // fallback to en if deviceLang is undefined or not in resources
    const finalLang =
      deviceLang && resources[deviceLang as keyof typeof resources]
        ? deviceLang
        : "en";
    await i18n.changeLanguage(finalLang);
  }
};

export default i18n;
