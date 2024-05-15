import * as SplashScreen from "expo-splash-screen";
import { useGGStore } from "@/app/store/GGStore.ts";
import { NavigationContainer, type NavigationContainerRef, type Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import { BUNGIE_MANIFEST_URL, CUSTOM_MANIFEST_URL, getFullProfile, getJsonBlob } from "@/app/bungie/BungieApi.ts";
import MainDrawer from "@/app/UI/MainDrawer.tsx";
import Login from "@/app/UI/Login.tsx";
import { useWindowDimensions } from "react-native";
import { enableFreeze } from "react-native-screens";
import { object, parse, string } from "valibot";
import Toast from "react-native-toast-message";
import { bungieManifestSchema } from "@/app/core/ApiResponse.ts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DetailsView from "@/app/inventory/pages/DetailsView.tsx";
import type { DestinyItemIdentifier } from "@/app/inventory/logic/Helpers.ts";

SplashScreen.preventAutoHideAsync();

const startupTime = performance.now();
useGGStore.getState().setAppStartupTime(startupTime);
useGGStore.getState().initAuthentication();
useGGStore.getState().initDefinitions();

enableFreeze(true);

async function init() {
  try {
    const customManifest = getJsonBlob(CUSTOM_MANIFEST_URL);
    const bungieManifest = getJsonBlob(BUNGIE_MANIFEST_URL);

    const manifest = await Promise.all([customManifest, bungieManifest]);
    const parsedManifest = parse(object({ version: string() }), manifest[0]);
    const parsedBungieManifest = parse(bungieManifestSchema, manifest[1]);
    await useGGStore.getState().loadCustomDefinitions(parsedManifest.version);
    await useGGStore.getState().loadBungieDefinitions(parsedBungieManifest);
  } catch (e) {
    // If the network call fails try to use the already downloaded version.
    console.error("Failed to load custom manifest", e);
    useGGStore.getState().loadCustomDefinitions(null);
  }
}
init();

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  Details: DestinyItemIdentifier;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const navigationContainerTheme: Theme = {
  colors: {
    primary: "#17101F",
    background: "#17101F",
    card: "#17101F",
    text: "#17101F",
    border: "#17101F",
    notification: "#17101F",
  },
  dark: false,
};
// If the them is not set a white background keeps showing during screen rotation
function App() {
  const definitionsReady = useGGStore((state) => state.definitionsReady);
  const authenticated = useGGStore((state) => state.authenticated);
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);
  const { width } = useWindowDimensions();
  const SCREEN_WIDTH = width;

  useEffect(() => {
    if (SCREEN_WIDTH) {
      useGGStore.getState().setInventorySectionWidth(SCREEN_WIDTH);
    }
  }, [SCREEN_WIDTH]);

  useEffect(() => {
    if (authenticated === "NO-AUTHENTICATION") {
      if (navigationRef.current) {
        navigationRef.current.navigate("Login");
      } else {
        console.error("No navigationRef");
      }
    } else if (authenticated === "AUTHENTICATED" && definitionsReady) {
      getFullProfile();
      useGGStore.getState().setLastRefreshTime();
      const intervalId = setInterval(refreshIfNeeded, 2000);

      return () => clearInterval(intervalId);
    }
  }, [authenticated, definitionsReady]);

  function refreshIfNeeded() {
    const lastRefresh = useGGStore.getState().lastRefreshTime;
    const now = performance.now();
    if (now - lastRefresh > 35000) {
      getFullProfile();
    }
  }

  return (
    <GestureHandlerRootView>
      <NavigationContainer ref={navigationRef} theme={navigationContainerTheme}>
        <RootStack.Navigator>
          <RootStack.Group>
            <RootStack.Screen
              name="Root"
              component={MainDrawer}
              options={{
                headerShown: false,
              }}
            />
            <RootStack.Screen
              name="Details"
              component={DetailsView}
              options={{
                headerBackTitle: "Back",
                headerStyle: {
                  backgroundColor: "#17101F",
                },
                headerTintColor: "white",
              }}
            />
          </RootStack.Group>
          <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
            <RootStack.Screen name="Login" component={Login} options={{ title: "Login" }} />
          </RootStack.Group>
        </RootStack.Navigator>
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
