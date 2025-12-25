import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface WarningModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  cancelText: string;
}

export default function WarningModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: WarningModalProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="warning-amber"
                  size={48}
                  color="#F59E0B" // Amber-500 equivalent
                />
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {title}
              </Text>

              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {message}
              </Text>

              <View style={styles.buttons}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: colors.inputBorder },
                  ]}
                >
                  <Text
                    style={[styles.buttonText, { color: colors.textPrimary }]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: "#F59E0B" },
                  ]}
                >
                  <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 158, 11, 0.1)", // Amber with opacity
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  confirmButton: {
    // Background color set via props/style
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
