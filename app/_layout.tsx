import NoInternetModal from "@/components/NoInternetModal";
import ServiceUnavailableModal from "@/components/ServiceUnavailableModal";
import { NetworkStatusProvider } from "@/context/NetworkStatusContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { initI18n } from "@/i18n";
import { getMyProfile } from "@/services/profile-endpoints";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import ToastManager from "toastify-react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>("index");
  const scheme = useColorScheme();

  useEffect(() => {
    const initializeApp = async () => {
      await initI18n();

      try {
        const token = await SecureStore.getItemAsync("API_TOKEN");

        if (!token) {
          setInitialRoute("index");
          return;
        }

        const profile = await getMyProfile();

        if (profile) {
          setInitialRoute("(tabs)");
        } else {
          setInitialRoute("create-profile");
        }
      } catch (e) {
        await SecureStore.deleteItemAsync("API_TOKEN");
        setInitialRoute("index");
      } finally {
        setReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NetworkStatusProvider>
        <Stack initialRouteName={initialRoute}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen
            name="create-profile"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <NoInternetModal />
        <ServiceUnavailableModal />
        <ToastManager
          useModal={false}
          theme={scheme === "dark" ? "dark" : "light"}
        />
      </NetworkStatusProvider>
    </ThemeProvider>
  );
}
