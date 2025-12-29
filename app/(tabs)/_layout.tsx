import { RecyclingProvider } from "@/context/RecyclingContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <RecyclingProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.inputBorder,
          },
          tabBarActiveTintColor: colors.buttonPrimaryBackground,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: t("dashboard"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: t("scan_tab"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="scan-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: t("leaderboard"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="leaderboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings_tab"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </RecyclingProvider>
  );
}
