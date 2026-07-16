import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ADMIN_PANEL_URL = "https://ria-admin.beytullahp.com";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [demoInfoVisible, setDemoInfoVisible] = useState(false);

  const openAdminPanel = () => {
    void Linking.openURL(ADMIN_PANEL_URL);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.helpButtonContainer}>
        <TouchableOpacity
          onPress={() => setDemoInfoVisible(true)}
          style={[
            styles.helpButton,
            { backgroundColor: colors.languageButtonBackground },
          ]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("demo_info_accessibility")}
        >
          <Text style={[styles.helpButtonText, { color: colors.textPrimary }]}>
            ?
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.langSwitcherContainer}>
        <LanguageSwitcher />
      </View>
      <View style={styles.heroSection}>
        <MaterialIcons
          name="recycling"
          size={120}
          color={colors.textPrimary}
          style={{ marginBottom: 24 }}
        />

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("welcome_title")}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("welcome_subtitle")}
        </Text>
      </View>

      <View
        style={[
          styles.buttonCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: colors.buttonPrimaryBackground },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
          >
            {t("get_started")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={[
            styles.button,
            styles.secondaryButton,
            { borderColor: colors.buttonPrimaryBackground },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.buttonText,
              { color: colors.buttonPrimaryBackground },
            ]}
          >
            {t("login_button")}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={demoInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDemoInfoVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <MaterialIcons
              name="info-outline"
              size={34}
              color={colors.textPrimary}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("demo_info_title")}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {t("demo_info_reset_message")}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {t("demo_info_admin_message")}
            </Text>
            <TouchableOpacity
              onPress={openAdminPanel}
              style={[
                styles.modalPrimaryButton,
                { backgroundColor: colors.buttonPrimaryBackground },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modalPrimaryButtonText,
                  { color: colors.buttonPrimaryText },
                ]}
              >
                {t("demo_info_open_admin")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDemoInfoVisible(false)}
              style={styles.modalSecondaryButton}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modalSecondaryButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                {t("close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  helpButtonContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  helpButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  helpButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  langSwitcherContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  buttonCard: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalIcon: {
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  modalPrimaryButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalPrimaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  modalSecondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
