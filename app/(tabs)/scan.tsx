import BinScanner from "@/components/BinScanner";
import RecyclingScanner from "@/components/RecyclingScanner";
import { useRecyclingSession } from "@/context/RecyclingContext";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScanScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isSessionActive, sessionStartTime, timeLeft, endSession } =
    useRecyclingSession();

  const [sessionExpiredModal, setSessionExpiredModal] = useState(false);

  useEffect(() => {
    if (!sessionStartTime) return;

    const intervalId = setInterval(() => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      const remaining = Math.max(0, Math.floor(timeLeft - elapsed));

      if (remaining <= 0) {
        setSessionExpiredModal(true);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionStartTime, timeLeft]);

  return (
    <View style={styles.container}>
      {/* State A: No Session -> Show Bin Scanner */}
      {/* State B: Session Active -> Show Item Scanner */}
      {isSessionActive ? <RecyclingScanner /> : <BinScanner />}

      {/* SESSION EXPIRED MODAL - Shared between both scanners */}
      <Modal
        visible={sessionExpiredModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.sessionModalContent,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <Text
              style={[styles.sessionModalTitle, { color: colors.textPrimary }]}
            >
              {t("session_expired_title")}
            </Text>
            <Text
              style={[
                styles.sessionModalMessage,
                { color: colors.textSecondary },
              ]}
            >
              {t("session_expired_message")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSessionExpiredModal(false);
                endSession();
              }}
              style={[
                styles.sessionModalButton,
                { backgroundColor: colors.buttonPrimaryBackground },
              ]}
            >
              <Text
                style={[
                  styles.sessionModalButtonText,
                  { color: colors.buttonPrimaryText },
                ]}
              >
                {t("ok")}
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sessionModalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignItems: "center",
  },
  sessionModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  sessionModalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  sessionModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
  },
  sessionModalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
