import { useTheme } from "@/context/ThemeContext";
import { setLanguage } from "@/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "tr", label: "Türkçe" },
    { code: "es", label: "Español" },
  ];

  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[
          styles.button,
          { backgroundColor: colors.languageButtonBackground || "transparent" },
        ]}
      >
        <MaterialIcons name="language" size={24} color={colors.iconColor} />
        <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
          {t("change_language")}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[styles.menu, { backgroundColor: colors.inputBackground }]}
            >
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.menuItem,
                    i18n.language === lang.code && {
                      backgroundColor: `${colors.buttonPrimaryBackground}20`,
                    },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text
                    style={[styles.menuText, { color: colors.textPrimary }]}
                  >
                    {lang.label}
                  </Text>
                  {i18n.language === lang.code && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.textPrimary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    width: 200,
    padding: 8,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
