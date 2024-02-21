import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { ErrorBoundaryProps, Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useReducer, useRef } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { clientID } from "@/constants/env";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import AuthService from "./authentication/AuthService";
import StorageGG from "./storage/StorageGG";
import { View, Text } from "react-native";
import { AuthState, authReducer, initialAuthState } from "./state/Actions";
import { DirectorProps } from "./screens/types";

export function ErrorBoundary(props: ErrorBoundaryProps) {
  console.log("ErrorBoundary", props);
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>{props.error.message}</Text>
      <Text onPress={props.retry}>Try Again?</Text>
    </View>
  );
}

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

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const storeRef = useRef<StorageGG | null>(null);
  const authServiceRef = useRef<AuthService | null>(null);

  const [loaded, error] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    const authServiceInstance = AuthService.getInstance();
    authServiceRef.current = authServiceInstance;
    AuthService.subscribe(dispatch);
    storeRef.current = StorageGG.getInstance();

    // Unsubscribe when the component unmounts
    return () => {
      AuthService.cleanUp();
      authServiceRef.current = null;
      AuthService.unsubscribe();
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
      // router.navigate({ pathname: "auth", params: { presentation: "fullScreenModal", state: state } });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  console.log("hmmm", state);
  return <RootLayoutNav state={state} />;
}

function RootLayoutNav(props: DirectorProps) {
  const colorScheme = useColorScheme();
  console.log("ello", props.state.initComplete);
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Text>{props.state.initComplete}</Text>
        <Text>HELLO</Text>
        <Stack>
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
          <Stack.Screen name="auth" options={{ presentation: "fullScreenModal" }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
