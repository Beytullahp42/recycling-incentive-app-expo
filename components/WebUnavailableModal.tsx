import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const IOS_EXPO_GO_URL = "https://apps.apple.com/us/app/expo-go/id982107779";
const ANDROID_EXPO_GO_URL =
  "https://play.google.com/store/apps/details?id=host.exp.exponent";

function openStoreUrl(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  Linking.openURL(url);
}

export default function WebUnavailableModal() {
  const { colors } = useTheme();

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => {}}
    >
      <View
        style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.88)" }]}
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            This app is unavailable for web
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            You can try it via scanning this link with Expo Go.
          </Text>

          <View style={styles.qrContainer}>
            <Image
              source={require("@/assets/images/qr-link.png")}
              style={styles.qrImage}
              accessibilityLabel="Expo Go QR code"
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={() => openStoreUrl(IOS_EXPO_GO_URL)}
              style={[
                styles.button,
                { backgroundColor: colors.buttonPrimaryBackground },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={colors.buttonPrimaryText}
              />
              <Text
                style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
              >
                Download Expo Go for iOS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openStoreUrl(ANDROID_EXPO_GO_URL)}
              style={[
                styles.button,
                { backgroundColor: colors.buttonPrimaryBackground },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons
                name="logo-google-playstore"
                size={20}
                color={colors.buttonPrimaryText}
              />
              <Text
                style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
              >
                Download Expo Go for Android
              </Text>
            </TouchableOpacity>
          </View>
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
    width: "100%",
    maxWidth: 460,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  qrContainer: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  qrImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
  button: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
