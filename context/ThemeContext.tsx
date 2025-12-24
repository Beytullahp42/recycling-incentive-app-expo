import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Theme,
} from "@react-navigation/native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeName = "light" | "dark" | null;

type ThemeContextType = {
  theme: "light" | "dark";
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  colors: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  themeName: null,
  setTheme: () => {},
  colors: Colors.light,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("user-theme-preference");
        if (saved === "light" || saved === "dark") {
          setThemeName(saved);
        }
      } catch (e) {
        console.error("Failed to load theme preference:", e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      if (name) {
        await AsyncStorage.setItem("user-theme-preference", name);
      } else {
        await AsyncStorage.removeItem("user-theme-preference");
      }
    } catch (e) {
      console.error("Failed to save theme preference:", e);
    }
  };

  const activeTheme = themeName ?? systemColorScheme ?? "light";
  const colors = Colors[activeTheme];
  const navigationTheme: Theme =
    activeTheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider
      value={{ theme: activeTheme, themeName, setTheme, colors }}
    >
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
};
