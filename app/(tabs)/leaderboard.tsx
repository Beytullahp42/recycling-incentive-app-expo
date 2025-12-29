import { useTheme } from "@/context/ThemeContext";
import { LeaderboardEntry, LeaderboardResponse } from "@/models/Leaderboard";
import {
  getLeaderboardAllTime,
  getLeaderboardCurrentSeason,
} from "@/services/leaderboard-endpoints";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Tab = "season" | "all_time";

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<Tab>("season");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  // Reusable fetch function
  const fetchLeaderboard = async (isSilentUpdate = false) => {
    // Only show the big loading spinner if it's not a silent update (background refresh)
    if (!isSilentUpdate) setLoading(true);

    try {
      let result;
      if (activeTab === "season") {
        result = await getLeaderboardCurrentSeason();
      } else {
        result = await getLeaderboardAllTime();
      }
      setData(result);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Refetch whenever the tab changes (Season vs All Time)
  // 2. Refetch whenever the screen gains focus (User comes back from Scan tab)
  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard(false); // Silent update when focusing to avoid flickering
    }, [activeTab])
  );

  // Pull to Refresh Handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(true); // Treat as a "load" to ensure data is fresh
    setRefreshing(false);
  };

  const getSeasonTitle = (leaderboardData: LeaderboardResponse) => {
    if (
      leaderboardData.type === "season" &&
      leaderboardData.month_number &&
      leaderboardData.year
    ) {
      const months = t("months", { returnObjects: true }) as string[];
      // month_number is 1-indexed, so subtract 1 for array index
      const monthName = months[leaderboardData.month_number - 1];
      return t("season_title", {
        month: monthName,
        year: leaderboardData.year,
      });
    }
    return leaderboardData.title; // Fallback or for all_time
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    const isTop3 = item.rank <= 3;
    let rankColor = colors.textPrimary;
    if (item.rank === 1) rankColor = "#FFD700"; // Gold
    else if (item.rank === 2) rankColor = "#C0C0C0"; // Silver
    else if (item.rank === 3) rankColor = "#CD7F32"; // Bronze

    return (
      <View
        style={[
          styles.itemContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankText,
              { color: rankColor, fontWeight: isTop3 ? "bold" : "normal" },
            ]}
          >
            {item.rank}
          </Text>
        </View>
        <View style={styles.userContainer}>
          <Text style={[styles.usernameText, { color: colors.textPrimary }]}>
            @{item.username}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text
            style={[
              styles.pointsText,
              { color: colors.buttonPrimaryBackground },
            ]}
          >
            {item.points}{" "}
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {t("points")}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Section wrapped in SafeAreaView to respect Notch/StatusBar */}
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("leaderboard")}
          </Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "season" && {
                backgroundColor: colors.buttonPrimaryBackground,
                borderColor: colors.buttonPrimaryBackground,
              },
              { borderColor: colors.inputBorder },
            ]}
            onPress={() => {
              setActiveTab("season");
              setLoading(true); // Explicit loading state for tab switch
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === "season" ? "#fff" : colors.textSecondary,
                },
              ]}
            >
              {t("season")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "all_time" && {
                backgroundColor: colors.buttonPrimaryBackground,
                borderColor: colors.buttonPrimaryBackground,
              },
              { borderColor: colors.inputBorder },
            ]}
            onPress={() => {
              setActiveTab("all_time");
              setLoading(true); // Explicit loading state for tab switch
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "all_time" ? "#fff" : colors.textSecondary,
                },
              ]}
            >
              {t("allTime")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Season Info / Title */}
        {data && (
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {activeTab === "season" ? getSeasonTitle(data) : t("allTime")}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color={colors.buttonPrimaryBackground}
            />
            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
              {t("loading")}
            </Text>
          </View>
        ) : (
          <>
            {data?.leaderboard.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={{ color: colors.textSecondary }}>
                  {data?.message || t("noCompetition")}
                </Text>
              </View>
            ) : (
              <FlatList
                data={data?.leaderboard || []}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.rank}-${item.username}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.buttonPrimaryBackground}
                  />
                }
              />
            )}
          </>
        )}
      </SafeAreaView>

      {/* User Stats (Floating at bottom) */}
      {data?.user_stats && !loading && (
        <View
          style={[
            styles.userStatsContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              bottom: insets.bottom + 10, // Float above the home indicator
            },
          ]}
        >
          <View
            style={[
              styles.itemContainer,
              {
                marginBottom: 0,
                borderWidth: 0,
                backgroundColor: "transparent",
              },
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, { color: colors.textPrimary }]}>
                {data.user_stats.rank}
              </Text>
            </View>
            <View style={styles.userContainer}>
              <Text
                style={[styles.usernameText, { color: colors.textPrimary }]}
              >
                @{data.user_stats.username} {t("you")}
              </Text>
            </View>
            <View style={styles.pointsContainer}>
              <Text
                style={[
                  styles.pointsText,
                  { color: colors.buttonPrimaryBackground },
                ]}
              >
                {data.user_stats.points}{" "}
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {t("points")}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  tabText: {
    fontWeight: "600",
  },
  infoContainer: {
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased padding to ensure list clears the footer
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "500",
  },
  pointsContainer: {
    minWidth: 60,
    alignItems: "flex-end",
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userStatsContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 16, // nice rounded corners
    borderWidth: 1, // borders all sides
    // Shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});
