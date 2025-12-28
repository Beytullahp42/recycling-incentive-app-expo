import { useTheme } from "@/context/ThemeContext";
import { useNetworkStatusStore } from "@/context/networkStatusStore";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NoInternetModal() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { status, retry, isChecking } = useNetworkStatusStore();

  if (status !== "NO_INTERNET") {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View
        style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.85)" }]}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <MaterialIcons
            name="wifi-off"
            size={80}
            color={colors.textPrimary}
            style={{ marginBottom: 20, opacity: 0.7 }}
          />

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("no_internet_title")}
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {t("no_internet_message")}
          </Text>

          <TouchableOpacity
            onPress={retry}
            disabled={isChecking}
            style={[
              styles.button,
              {
                backgroundColor: colors.buttonPrimaryBackground,
                opacity: isChecking ? 0.7 : 1,
              },
            ]}
            activeOpacity={0.8}
          >
            {isChecking ? (
              <ActivityIndicator color={colors.buttonPrimaryText} />
            ) : (
              <Text
                style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
              >
                {t("try_again")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
