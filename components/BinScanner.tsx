import { useTheme } from "@/context/ThemeContext";
import { startSession as apiStartSession } from "@/services/transaction-endpoints";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router"; // <--- IMPORT THIS
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BinScannerProps = {
  onSessionStarted: (token: string, binName: string, timeLeft: number) => void;
};

export default function BinScanner({ onSessionStarted }: BinScannerProps) {
  const { colors } = useTheme();

  // --- 1. State & Refs ---
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();

  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGpsEnabled, setIsGpsEnabled] = useState(true);

  const latestLocation = useRef<Location.LocationObject | null>(null);
  const appState = useRef(AppState.currentState);

  // --- 2. GPS Service Checker ---
  // Returns TRUE if services are on, FALSE if off
  const checkLocationServices = async (showError = true) => {
    const enabled = await Location.hasServicesEnabledAsync();
    setIsGpsEnabled(enabled);

    if (!enabled && showError) {
      Alert.alert(
        "Location Services Disabled",
        "You must turn on your device location (GPS) to verify the bin.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
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
        Alert.alert("GPS Error", "Please stand still and try again.");
        return;
      }
    }

    const { latitude, longitude, accuracy } = latestLocation.current.coords;

    if (accuracy && accuracy > 60) {
      Alert.alert(
        "Weak Signal",
        "GPS accuracy is low. Please wait a moment for a better signal."
      );
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
        onSessionStarted(
          response.session_token,
          response.bin_name,
          response.time_left
        );
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to start session. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not verify bin location.");
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
          We need both Camera and Location permissions to verify you are at the
          recycling bin.
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
              Grant Camera Permission
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
              Grant Location Permission
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
            ? "Scanning... Tap to cancel"
            : isGpsEnabled
            ? "Point at QR code & tap below"
            : "GPS Disabled - Cannot Scan"}
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
              {isScanning ? "STOP" : "SCAN"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
});
