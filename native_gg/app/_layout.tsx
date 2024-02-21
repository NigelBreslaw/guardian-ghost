import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { clientID } from "@/constants/env";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import AuthService from "./authentication/AuthService";
import StorageGG from "./storage/StorageGG";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  if (process.env.NODE_ENV === "development" && clientID === undefined) {
    console.warn("No .ENV file found. Please create one.");
  }

  const storeRef = useRef<StorageGG | null>(null);
  const authServiceRef = useRef<AuthService | null>(null);

  const [loaded, error] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    authServiceRef.current = AuthService.getInstance();
    storeRef.current = StorageGG.getInstance();
    // Unsubscribe when the component unmounts
    return () => {
      AuthService.cleanUp();
      authServiceRef.current = null;
      StorageGG.cleanUp();
      storeRef.current = null;
    };
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // router.navigate({ pathname: "auth", params: { presentation: "fullScreenModal" } });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ presentation: "fullScreenModal" }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
