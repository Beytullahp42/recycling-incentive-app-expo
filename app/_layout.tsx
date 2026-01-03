import NetworkStatusInitializer from "@/components/NetworkStatusInitializer";
import NoInternetModal from "@/components/NoInternetModal";
import ServiceUnavailableModal from "@/components/ServiceUnavailableModal";
import { useAuthStore } from "@/context/authStore";
import { ThemeProvider } from "@/context/ThemeContext";
import { initI18n } from "@/i18n";
import { getMyProfile } from "@/services/profile-endpoints";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import ToastManager from "toastify-react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>("index");
  const scheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, setAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      await initI18n();

      try {
        const hasToken = await checkAuth();

        if (!hasToken) {
          setInitialRoute("index");
          return;
        }

        const profile = await getMyProfile();

        if (profile) {
          setInitialRoute("(tabs)");
          setAuthenticated(true);
        } else {
          setInitialRoute("create-profile");
          setAuthenticated(true);
        }
      } catch (e: unknown) {
        const isNetworkError =
          e instanceof Error &&
          "code" in e &&
          (e as { code?: string }).code === "ERR_NETWORK";

        if (!isNetworkError) {
          setAuthenticated(false);
          setInitialRoute("index");
        }
      } finally {
        setReady(true);
      }
    };

    initializeApp();
  }, [checkAuth, setAuthenticated]);

  useEffect(() => {
    if (ready && isAuthenticated === false) {
      router.replace("/");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NetworkStatusInitializer />
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="create-profile" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <NoInternetModal />
      <ServiceUnavailableModal />
      <ToastManager
        useModal={false}
        theme={scheme === "dark" ? "dark" : "light"}
      />
    </ThemeProvider>
  );
}
