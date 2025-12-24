import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
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
});
