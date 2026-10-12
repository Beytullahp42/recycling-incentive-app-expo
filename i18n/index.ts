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

const getDeviceLanguage = () => {
  const deviceLang = Localization.getLocales()[0]?.languageCode;
  return deviceLang && deviceLang in resources ? deviceLang : "en";
};

export const initI18n = async () => {
  let savedLanguage: string | null = null;
  try {
    savedLanguage = await AsyncStorage.getItem("language");
  } catch {
    console.warn("Could not load the language preference. Using device language.");
  }

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage && savedLanguage in resources
      ? savedLanguage
      : getDeviceLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
};

export const setLanguage = async (langCode: string | null) => {
  const language = langCode && langCode in resources ? langCode : getDeviceLanguage();
  await i18n.changeLanguage(language);
  try {
    if (langCode && langCode in resources) {
      await AsyncStorage.setItem("language", langCode);
    } else {
      await AsyncStorage.removeItem("language");
    }
  } catch {
    console.warn("Could not save the language preference.");
  }
};

export default i18n;
