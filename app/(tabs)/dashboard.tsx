import { useTheme } from "@/context/ThemeContext";
import { DashboardStats } from "@/models/Dashboard";
import { getDashboardStats, getMyProfile } from "@/services/profile-endpoints";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [profileName, setProfileName] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [profile, dashboardStats] = await Promise.all([
        getMyProfile(),
        getDashboardStats(),
      ]);

      if (profile) {
        setProfileName(profile.first_name);
      }
      if (dashboardStats) {
        setStats(dashboardStats);
      }
    } catch {
      // Fail silently or show toast
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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

  const renderRivalCard = () => {
    if (!stats) return null;

    if (stats.rank === 1) {
      // Special centered card for Champion
      return (
        <View
          style={[
            styles.rivalCard,
            styles.championCard,
            { backgroundColor: "#FFF8E1", borderColor: "#FFD700" },
          ]}
        >
          <FontAwesome5 name="crown" size={40} color="#FFD700" />
          <Text style={[styles.championTitle, { color: colors.textPrimary }]}>
            {t("champion_message")}
          </Text>
          <Text style={[styles.rivalMessage, { color: colors.textSecondary }]}>
            {t("keep_it_up")}
          </Text>
        </View>
      );
    }

    let message = "";
    let iconName = "trophy";
    let messageTitle = t("rival_challenge");

    if (stats.rival) {
      // Rival exists
      message = t("rival_message", {
        gap: stats.rival.gap,
        rival: stats.rival.username,
      });
      iconName = "running";
    } else {
      // Unranked or no rival
      message = t("start_recycling");
      iconName = "recycle";
      messageTitle = t("start_recycling"); // Use a different title or hide it?
    }

    return (
      <View
        style={[
          styles.rivalCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <View style={styles.rivalHeader}>
          <Text style={[styles.rivalTitle, { color: colors.textPrimary }]}>
            {t("rival_challenge")}
          </Text>
          <FontAwesome5
            name={iconName}
            size={20}
            color={colors.buttonPrimaryBackground}
          />
        </View>
        <Text style={[styles.rivalMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
            {t("dashboard_welcome", { name: profileName })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("keep_it_up")}
          </Text>
        </View>

        {/* Main Score Display */}
        <View style={styles.scoreContainer}>
          {/* Background Decorative Icons */}
          <View pointerEvents="none" style={styles.backgroundIcons}>
            <FontAwesome5
              name="wine-bottle"
              size={50}
              color={colors.inputBorder}
              style={{
                position: "absolute",
                top: -10,
                left: 20,
                opacity: 0.2,
                transform: [{ rotate: "-15deg" }],
              }}
            />
            <FontAwesome5
              name="recycle"
              size={40}
              color={colors.inputBorder}
              style={{
                position: "absolute",
                bottom: 10,
                right: 30,
                opacity: 0.2,
                transform: [{ rotate: "20deg" }],
              }}
            />
            <FontAwesome5
              name="leaf"
              size={30}
              color={colors.inputBorder}
              style={{
                position: "absolute",
                top: 40,
                right: 60,
                opacity: 0.15,
                transform: [{ rotate: "45deg" }],
              }}
            />
          </View>

          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            {t("current_score")}
          </Text>
          <Text
            style={[
              styles.scoreValue,
              { color: colors.buttonPrimaryBackground },
            ]}
          >
            {stats?.score || 0}
          </Text>
        </View>

        {/* Rival / Status Card */}
        {renderRivalCard()}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Background Decorative Icons for Lower Part */}
          <View pointerEvents="none" style={styles.backgroundIcons}>
            <FontAwesome5
              name="seedling"
              size={40}
              color={colors.inputBorder}
              style={{
                position: "absolute",
                bottom: -30,
                left: 10,
                opacity: 0.15,
                transform: [{ rotate: "-25deg" }],
              }}
            />
            <FontAwesome5
              name="cloud-sun"
              size={45}
              color={colors.inputBorder}
              style={{
                position: "absolute",
                top: 20,
                right: -10,
                opacity: 0.15,
                transform: [{ rotate: "10deg" }],
              }}
            />
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <MaterialIcons
              name="leaderboard"
              size={24}
              color={colors.buttonPrimaryBackground}
            />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats?.rank || "-"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t("current_rank")}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <MaterialIcons
              name="recycling"
              size={24}
              color={colors.buttonPrimaryBackground}
            />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats?.total_items || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t("total_recycled")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
    paddingVertical: 20,
  },
  backgroundIcons: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: "800",
    lineHeight: 70,
    zIndex: 1, // Ensure text is above bg icons
  },
  rivalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  championCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  championTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  rivalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rivalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  rivalMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});
