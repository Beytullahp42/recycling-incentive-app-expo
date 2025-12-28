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

  // Initial app setup
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
        // Only redirect to index for actual auth errors,
        // not for network errors (which are handled by the modals)
        const isNetworkError =
          e instanceof Error &&
          "code" in e &&
          (e as { code?: string }).code === "ERR_NETWORK";

        if (!isNetworkError) {
          setAuthenticated(false);
          setInitialRoute("index");
        }
        // If it's a network error, keep the current initialRoute
        // The ServiceUnavailableModal will handle the UI
      } finally {
        setReady(true);
      }
    };

    initializeApp();
  }, [checkAuth, setAuthenticated]);

  // React to auth state changes (e.g., 401 response triggers logout)
  useEffect(() => {
    // Only redirect if we've finished initial setup and auth becomes false
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
