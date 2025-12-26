import { useTheme } from "@/context/ThemeContext";
import { logout } from "@/services/auth-endpoints";
import { getMyProfile } from "@/services/profile-endpoints";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [profileName, setProfileName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getMyProfile();
      if (profile) {
        setProfileName(profile.first_name);
      } else {
        // Should not happen if we are on dashboard, but handle safe
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
    Toast.success(t("logged_out"));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.buttonPrimaryBackground}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
          Welcome, {profileName}!
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          Dashboard Content Coming Soon...
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: colors.buttonDangerBackground },
          ]}
        >
          <MaterialIcons name="logout" size={20} color="#FFF" />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  placeholderText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginTop: 40,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
