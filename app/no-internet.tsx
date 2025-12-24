import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as Network from "expo-network";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function NoInternetScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected) {
        Toast.success(t("internet_back"));
        // Determine if we should replace or push.
        // Since this is likely blocking the app, replacing to root is usually safe.
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/");
      } else {
        Toast.error(t("still_no_connection"));
      }
    } catch (error) {
      Toast.error(t("error_checking_connection"));
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <MaterialIcons
          name="wifi-off"
          size={80}
          color={colors.textPrimary}
          style={{ marginBottom: 20, opacity: 0.5 }}
        />

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("no_internet_title")}
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t("no_internet_message")}
        </Text>

        <TouchableOpacity
          onPress={checkConnection}
          disabled={checking}
          style={[
            styles.button,
            {
              backgroundColor: colors.buttonPrimaryBackground,
              opacity: checking ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          {checking ? (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
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
  status: {
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
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
