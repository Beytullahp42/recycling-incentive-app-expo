import { useRecyclingSession } from "@/context/RecyclingContext";
import { useTheme } from "@/context/ThemeContext";
import {
  endSession as endSessionApi,
  submitItem,
  uploadProof,
} from "@/services/transaction-endpoints";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function RecyclingScanner() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    sessionToken,
    binName,
    scannedItems,
    hasSessionProof,
    sessionStartTime,
    timeLeft,
    endSession,
    registerScan,
    unlockUnlimited,
  } = useRecyclingSession();

  const [permission, requestPermission] = useCameraPermissions();

  // MODES: 'idle' | 'scanning' | 'camera'
  const [mode, setMode] = useState<"idle" | "scanning" | "camera">("idle");

  // UI States
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local timer display
  const [remaining, setRemaining] = useState(timeLeft);

  const cameraRef = useRef<CameraView>(null);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (!sessionStartTime) return;

    const intervalId = setInterval(() => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      const newValue = Math.max(0, Math.floor(timeLeft - elapsed));
      setRemaining(newValue);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionStartTime, timeLeft]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- Permission Screens ---
  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.buttonPrimaryBackground}
        />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
          {t("scanner_permission_camera")}
        </Text>
        <TouchableOpacity
          style={[
            styles.permissionButton,
            { backgroundColor: colors.buttonPrimaryBackground },
          ]}
          onPress={requestPermission}
        >
          <Text
            style={[styles.buttonText, { color: colors.buttonPrimaryText }]}
          >
            {t("grant_camera_permission")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- SCAN TOGGLE ---
  function toggleScanning() {
    if (mode === "scanning") {
      setMode("idle");
    } else {
      setMode("scanning");
    }
  }

  // --- BARCODE HANDLER ---
  async function handleBarcodeScanned(scanningResult: { data: string }) {
    if (mode !== "scanning" || isSubmitting) return;

    const barcode = scanningResult.data;

    // Check duplicate in frontend first
    const isDuplicate = scannedItems.has(barcode);

    if (isDuplicate && !hasSessionProof) {
      // Duplicate detected, require photo proof
      setMode("camera");
      Toast.warn(t("duplicate_warning"));
    } else {
      // Either new item or proof already uploaded
      setMode("idle");
      await submitScanToBackend(barcode, isDuplicate);
    }
  }

  // --- SUBMIT SCAN TO BACKEND ---
  async function submitScanToBackend(barcode: string, isDuplicate: boolean) {
    if (!sessionToken) return;

    setIsSubmitting(true);

    try {
      const response = await submitItem(sessionToken, barcode);

      if (response.success) {
        // Register the scan locally
        if (!isDuplicate) {
          registerScan(barcode);
        }

        if (isDuplicate) {
          Toast.info(t("recycled_pending", { item: response.item_name }));
        } else {
          Toast.success(
            t("recycled_success", {
              item: response.item_name,
              points: response.points_awarded,
            })
          );
        }
      } else {
        // Check if backend requires proof
        if (response.requires_proof) {
          setMode("camera");
          Toast.warn(response.message || t("photo_proof_required"));
        } else {
          Toast.error(response.message || t("submit_failed"));
        }
      }
    } catch (error) {
      console.error(error);
      Toast.error(t("network_error_retry"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- PHOTO CHALLENGE ---
  async function takeProofPhoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (e) {
      console.error(e);
      Toast.error(t("photo_capture_failed"));
    }
  }

  async function handleSendPhoto() {
    if (!capturedImage || !sessionToken) return;

    setIsUploading(true);

    try {
      const response = await uploadProof(sessionToken, {
        uri: capturedImage,
        name: `proof_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      if (response.success) {
        Toast.success(t("proof_uploaded"));
        unlockUnlimited();
        setCapturedImage(null);
        setMode("idle");
      } else {
        Toast.error(response.message || t("upload_failed"));
      }
    } catch (error) {
      console.error(error);
      Toast.error(t("upload_failed_retry"));
    } finally {
      setIsUploading(false);
    }
  }

  // --- MANUAL END SESSION ---
  async function handleManualEndSession() {
    if (!sessionToken) return;

    try {
      const response = await endSessionApi(sessionToken);

      if (response.success) {
        Toast.success(response.message || t("session_ended_success"));
        endSession(); // Context clear
      } else {
        Toast.error(response.message || t("session_end_failed"));
      }
    } catch (error) {
      console.error(error);
      Toast.error(t("network_error_retry"));
    }
  }

  // --- DERIVED STATE ---
  const isScanning = mode === "scanning";
  const scanButtonColor = isScanning ? "#2ecc71" : "#3498db";
  const scanWindowBorderColor = isScanning
    ? "#2ecc71"
    : "rgba(255,255,255,0.5)";

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={
          mode === "scanning" ? handleBarcodeScanned : undefined
        }
      />

      {/* --- SESSION HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerLabel}>{t("connected_to")}</Text>
            <Text style={styles.binName}>{binName}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={styles.timerContainer}>
              <Ionicons
                name="time-outline"
                size={20}
                color={remaining < 30 ? "#e74c3c" : "white"}
              />
              <Text
                style={[styles.timerText, remaining < 30 && styles.timerUrgent]}
              >
                {formatTime(remaining)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleManualEndSession}
              style={{
                backgroundColor: "#2980b9",
                padding: 6,
                borderRadius: 20,
              }}
            >
              <Ionicons name="power" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* OVERLAY */}
      <View style={styles.overlay}>
        {/* --- STATE 1: IDLE or SCANNING --- */}
        {(mode === "idle" || mode === "scanning") && (
          <View style={styles.scannerControls}>
            {/* Scan Window */}
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
              {isScanning ? t("barcode_hint_scanning") : t("barcode_hint_idle")}
            </Text>

            {/* SCAN BUTTON */}
            {isSubmitting ? (
              <ActivityIndicator
                size="large"
                color={colors.buttonPrimaryBackground}
                style={styles.loadingIndicator}
              />
            ) : (
              <TouchableOpacity
                onPress={toggleScanning}
                style={[
                  styles.scanButton,
                  { backgroundColor: scanButtonColor },
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
        )}

        {/* --- STATE 2: CAMERA MODE (Photo Challenge) --- */}
        {mode === "camera" && (
          <View style={styles.cameraControls}>
            <View style={styles.batchAlert}>
              <Text style={styles.batchText}>
                {t("duplicate_alert_title")}
                {"\n"}
                {t("duplicate_alert_text")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={takeProofPhoto}
              style={styles.shutterButton}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode("idle")}
              style={styles.cancelLink}
            >
              <Text style={{ color: "white", marginTop: 15 }}>
                {t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* PREVIEW MODAL */}
      <Modal
        visible={!!capturedImage}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.previewContainer}>
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
            />
          )}
          <View style={styles.previewOverlay}>
            <TouchableOpacity
              onPress={() => setCapturedImage(null)}
              style={styles.closeBtn}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                onPress={handleSendPhoto}
                style={styles.sendBtn}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.sendText}>{t("upload_unlock")}</Text>
                )}
              </TouchableOpacity>
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
  },

  // --- HEADER STYLES ---
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 15,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    color: "#ccc",
    fontSize: 12,
    textTransform: "uppercase",
  },
  binName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  timerUrgent: {
    color: "#e74c3c",
  },

  // Scanner Controls
  scannerControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
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

  // Camera Controls (Photo Challenge)
  cameraControls: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 50,
  },
  batchAlert: {
    position: "absolute",
    top: 140,
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 10,
    width: "80%",
  },
  batchText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  cancelLink: {
    opacity: 0.8,
  },

  // Preview UI
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 30,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  sendBtn: {
    backgroundColor: "#2ecc71",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  sendText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
