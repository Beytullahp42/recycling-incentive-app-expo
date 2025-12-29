import TutorialModal from "@/components/TutorialModal";
import { useRecyclingSession } from "@/context/RecyclingContext";
import { useTheme } from "@/context/ThemeContext";
import { startSession as apiStartSession } from "@/services/transaction-endpoints";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BinScanner() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { startSession } = useRecyclingSession();

  // --- 1. State & Refs ---
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();

  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGpsEnabled, setIsGpsEnabled] = useState(true);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [modalActions, setModalActions] = useState<
    { text: string; onPress: () => void; style?: "primary" | "cancel" }[]
  >([]);

  // Tutorial Modal State
  const [tutorialVisible, setTutorialVisible] = useState(false);

  const latestLocation = useRef<Location.LocationObject | null>(null);
  const appState = useRef(AppState.currentState);

  // --- 2. GPS Service Checker ---
  // Returns TRUE if services are on, FALSE if off
  const showModal = (
    title: string,
    message: string,
    actions: {
      text: string;
      onPress: () => void;
      style?: "primary" | "cancel";
    }[]
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalActions(actions);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const checkLocationServices = async (showError = true) => {
    const enabled = await Location.hasServicesEnabledAsync();
    setIsGpsEnabled(enabled);

    if (!enabled && showError) {
      showModal(
        t("location_services_disabled_title"),
        t("location_services_disabled_message"),
        [
          {
            text: t("cancel"),
            style: "cancel",
            onPress: hideModal,
          },
          {
            text: t("open_settings"),
            style: "primary",
            onPress: async () => {
              hideModal();
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                try {
                  await Linking.sendIntent(
                    "android.settings.LOCATION_SOURCE_SETTINGS"
                  );
                } catch (e) {
                  console.log("Error opening settings:", e);
                  // Fallback to general settings if the specific intent fails
                  Linking.openSettings();
                }
              }
            },
          },
        ]
      );
    }
    return enabled;
  };

  // --- 3. NEW: Focus Listener (Runs every time you switch to this tab) ---
  useFocusEffect(
    useCallback(() => {
      // Check GPS status immediately when tab becomes active
      checkLocationServices(false);

      // Optional: Reset scanning state if they leave and come back?
      // setIsScanning(false);

      return () => {
        // Cleanup if needed when tab loses focus
      };
    }, [])
  );

  // --- 4. App State Listener (Kept for when minimizing app) ---
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkLocationServices(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkTutorial = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem("seen-tutorial");
        if (hasSeen !== "true") {
          setTutorialVisible(true);
        }
      } catch (error) {
        console.log("Error checking tutorial status:", error);
      }
    };
    checkTutorial();
  }, []);

  const closeTutorial = async () => {
    setTutorialVisible(false);
    try {
      await AsyncStorage.setItem("seen-tutorial", "true");
    } catch (error) {
      console.log("Error saving tutorial preference:", error);
    }
  };

  const openTutorial = () => {
    setTutorialVisible(true);
  };

  // --- 5. GPS Watcher Logic ---
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startGPSWatcher = async () => {
      if (!locationPermission?.granted) return;

      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) return;

      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 5,
            timeInterval: 1000,
          },
          (loc) => {
            latestLocation.current = loc;
          }
        );
      } catch (e) {
        console.log("Error starting GPS watcher:", e);
      }
    };

    startGPSWatcher();

    return () => {
      subscription?.remove();
    };
  }, [locationPermission, isGpsEnabled]);

  // --- 6. Scanning Action Handler ---
  async function handleToggleScan() {
    if (!isScanning) {
      const isServiceOn = await checkLocationServices(true);
      if (!isServiceOn) return;
    }
    setIsScanning((prev) => !prev);
  }

  // --- 7. Barcode Handler ---
  async function handleBinScanned({ data }: { data: string }) {
    if (!isScanning || loading) return;

    const isServiceOn = await checkLocationServices(true);
    if (!isServiceOn) {
      setIsScanning(false);
      return;
    }

    if (!latestLocation.current) {
      try {
        latestLocation.current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
      } catch (e) {
        showModal(t("gps_error"), t("gps_error_message"), [
          { text: t("ok"), style: "primary", onPress: hideModal },
        ]);
        return;
      }
    }

    const { latitude, longitude, accuracy } = latestLocation.current.coords;

    if (accuracy && accuracy > 60) {
      showModal(t("weak_signal_title"), t("weak_signal_message"), [
        { text: t("ok"), style: "primary", onPress: hideModal },
      ]);
      return;
    }

    setIsScanning(false);
    setLoading(true);

    try {
      console.log("Starting session...", { latitude, longitude, qr: data });

      const response = await apiStartSession({
        qr_key: data,
        latitude: latitude,
        longitude: longitude,
      });

      if (response.success) {
        startSession(
          response.session_token,
          response.bin_name,
          response.time_left
        );
      } else {
        showModal(
          t("gps_error"),
          response.message || t("session_start_error"),
          [{ text: t("ok"), style: "primary", onPress: hideModal }]
        );
      }
    } catch (error) {
      console.error(error);
      showModal(t("network_error"), t("network_error_message"), [
        { text: t("ok"), style: "primary", onPress: hideModal },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // --- UI RENDER ---
  if (!cameraPermission || !locationPermission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.buttonPrimaryBackground}
        />
      </View>
    );
  }

  if (!cameraPermission.granted || !locationPermission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
          {t("scanner_permission_text")}
        </Text>
        {/* Buttons... */}
        {!cameraPermission.granted && (
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: colors.buttonPrimaryBackground },
            ]}
            onPress={requestCameraPermission}
          >
            <Text
              style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
            >
              {t("grant_camera_permission")}
            </Text>
          </TouchableOpacity>
        )}

        {!locationPermission.granted && (
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: colors.buttonPrimaryBackground },
            ]}
            onPress={requestLocationPermission}
          >
            <Text
              style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
            >
              {t("grant_location_permission")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const scanButtonColor = isScanning ? "#2ecc71" : "#3498db";
  const scanWindowBorderColor = isScanning
    ? "#2ecc71"
    : "rgba(255,255,255,0.5)";

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={isScanning ? handleBinScanned : undefined}
      />

      <View style={styles.overlay}>
        <View
          style={[
            styles.scanWindow,
            {
              borderColor: scanWindowBorderColor,
              borderWidth: isScanning ? 4 : 2,
            },
          ]}
        />

        <Text style={styles.hintText}>
          {isScanning
            ? t("scan_hint_scanning")
            : isGpsEnabled
            ? t("scan_hint_idle")
            : t("scan_hint_gps_disabled")}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.buttonPrimaryBackground}
            style={styles.loadingIndicator}
          />
        ) : (
          <TouchableOpacity
            onPress={handleToggleScan}
            style={[
              styles.scanButton,
              { backgroundColor: isGpsEnabled ? scanButtonColor : "#7f8c8d" },
              isScanning && styles.scanButtonActive,
            ]}
          >
            <Ionicons
              name={isScanning ? "stop" : "scan-outline"}
              size={40}
              color="white"
            />
            <Text style={styles.scanButtonText}>
              {isScanning ? t("scan_button_stop") : t("scan_button")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tutorial Trigger Button */}
      <TouchableOpacity
        style={styles.tutorialButton}
        onPress={openTutorial}
        activeOpacity={0.7}
      >
        <Ionicons name="help-circle-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* TUTORIAL MODAL */}
      <TutorialModal visible={tutorialVisible} onClose={closeTutorial} />

      {/* CUSTOM MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {modalTitle}
            </Text>
            <Text
              style={[styles.modalMessage, { color: colors.textSecondary }]}
            >
              {modalMessage}
            </Text>
            <View style={styles.modalActions}>
              {modalActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  style={[
                    styles.modalButton,
                    action.style === "primary"
                      ? {
                          backgroundColor: colors.buttonPrimaryBackground,
                        }
                      : {
                          backgroundColor: colors.inputBorder,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      action.style === "primary"
                        ? { color: colors.buttonPrimaryText }
                        : { color: colors.textPrimary },
                    ]}
                  >
                    {action.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 250,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanWindow: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 40,
    backgroundColor: "transparent",
  },
  hintText: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  scanButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  scanButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },
  loadingIndicator: {
    marginTop: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  tutorialButton: {
    position: "absolute",
    top: 50, // Adjust for status bar if needed, usually SafeAreaView handles top but we have a custom camera view
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
