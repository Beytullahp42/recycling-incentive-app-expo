import NetworkStatusInitializer from "@/components/NetworkStatusInitializer";
import NoInternetModal from "@/components/NoInternetModal";
import ServiceUnavailableModal from "@/components/ServiceUnavailableModal";
import WebUnavailableModal from "@/components/WebUnavailableModal";
import { useAuthStore } from "@/context/authStore";
import { ThemeProvider } from "@/context/ThemeContext";
import { initI18n } from "@/i18n";
import { getMyProfile } from "@/services/profile-endpoints";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, useColorScheme, View } from "react-native";
import ToastManager from "toastify-react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>("index");
  const scheme = useColorScheme();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const restoredStartupRoute = useRef(false);
  const { isAuthenticated, setAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initI18n();

        if (Platform.OS === "web") {
          setInitialRoute("index");
          return;
        }

        const hasToken = await checkAuth();

        if (!hasToken) {
          setInitialRoute("index");
          return;
        }

        const profile = await getMyProfile();

        if (!useAuthStore.getState().isAuthenticated) {
          setInitialRoute("index");
          return;
        }

        if (profile) {
          setInitialRoute("(tabs)");
          setAuthenticated(true);
        } else {
          setInitialRoute("create-profile");
          setAuthenticated(true);
        }
      } catch {
        // A failed profile request does not invalidate a saved login.
        // The API interceptor clears authentication when the server returns 401.
        if (useAuthStore.getState().isAuthenticated) {
          setInitialRoute("(tabs)");
        } else {
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
    if (Platform.OS === "web" || !ready || !navigationState?.key) {
      return;
    }

    // Expo Router resolves a launcher start to `/`. initialRouteName alone
    // does not redirect that URL to the restored authenticated screen.
    if (!restoredStartupRoute.current) {
      restoredStartupRoute.current = true;
      if (isAuthenticated && initialRoute === "(tabs)") {
        router.replace("/(tabs)/dashboard");
      } else if (isAuthenticated && initialRoute === "create-profile") {
        router.replace("/create-profile");
      }
    }

    if (isAuthenticated === false) {
      router.replace("/");
    }
  }, [ready, navigationState?.key, isAuthenticated, initialRoute, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {Platform.OS !== "web" && <NetworkStatusInitializer />}
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="create-profile" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {Platform.OS === "web" ? (
        <WebUnavailableModal />
      ) : (
        <>
          <NoInternetModal />
          <ServiceUnavailableModal />
        </>
      )}
      <ToastManager
        useModal={false}
        theme={scheme === "dark" ? "dark" : "light"}
      />
    </ThemeProvider>
  );
}
