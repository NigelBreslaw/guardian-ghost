import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer, type NavigationContainerRef, type Theme } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { StatusBar, useWindowDimensions, Text, Platform, Appearance, TextInput } from "react-native";
import { enableFreeze } from "react-native-screens";
import { object, parse, string } from "valibot";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@rn-primitives/portal";
import { enableScreens } from "react-native-screens";

// Enable screens for better performance
enableScreens();

import { BUNGIE_MANIFEST_URL, CUSTOM_MANIFEST_URL, getFullProfile } from "@/app/bungie/BungieApi.ts";
import { getJsonBlob } from "@/app/utilities/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { bungieManifestSchema } from "@/app/core/ApiResponse.ts";
import type { DestinyItemIdentifier } from "@/app/inventory/logic/Helpers.ts";
import App from "@/app/App"; // Do not use the file extension or the web version will fail to be used.
import "@/global.css";

SplashScreen.preventAutoHideAsync();
if (Platform.OS !== "web") {
  Appearance.setColorScheme("dark");
}

enableFreeze(true);

let customDownloadAttempts = 0;
async function getCustomItemDefinition() {
  try {
    const customManifest = getJsonBlob(CUSTOM_MANIFEST_URL);
    const manifest = await customManifest;
    const parsedManifest = parse(object({ version: string() }), manifest);
    await useGGStore.getState().loadCustomDefinitions(parsedManifest.version);
  } catch (e) {
    console.error("Failed to load custom manifest", e);
    if (customDownloadAttempts < 5) {
      customDownloadAttempts++;
      getCustomItemDefinition();
    } else {
      console.error("Failed to download custom manifest");
    }
  }
}

let bungieDownloadAttempts = 0;
async function getBungieDefinitions() {
  try {
    const bungieManifest = getJsonBlob(BUNGIE_MANIFEST_URL, true);
    const manifest = await bungieManifest;
    const parsedManifest = parse(bungieManifestSchema, manifest);
    await useGGStore.getState().loadBungieDefinitions(parsedManifest);
  } catch (e) {
    console.error("Failed to load bungie manifest", e);
    if (bungieDownloadAttempts < 5) {
      console.log("Failed to load bungie manifest. Trying again");
      bungieDownloadAttempts++;
      getBungieDefinitions();
    } else {
      console.error("Failed to download bungie manifest");
    }
  }
}

async function init() {
  useGGStore.getState().initAuthentication();
  getCustomItemDefinition();
  getBungieDefinitions();
}
init();

export type RootStackParamList = {
  Root: undefined;
  Login: undefined;
  Details: DestinyItemIdentifier;
};

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

function refreshIfNeeded() {
  const lastRefresh = useGGStore.getState().lastRefreshTime;
  const now = performance.now();
  if (now - lastRefresh > 35000) {
    getFullProfile();
  }
}

// If the them is not set a white background keeps showing during screen rotation
function Root() {
  "use memo";

  // TODO: This hack turns off the font scaling. At some point accessibility will be added to the app.
  interface TextWithDefaultProps extends Text {
    defaultProps?: { allowFontScaling?: boolean };
  }

  interface TextInputWithDefaultProps extends TextInput {
    defaultProps?: { allowFontScaling?: boolean };
  }

  (Text as unknown as TextWithDefaultProps).defaultProps = {
    ...((Text as unknown as TextWithDefaultProps).defaultProps || {}),
    allowFontScaling: false,
  };

  (TextInput as unknown as TextInputWithDefaultProps).defaultProps = {
    ...((TextInput as unknown as TextInputWithDefaultProps).defaultProps || {}),
    allowFontScaling: false,
  };

  const itemsDefinitionReady = useGGStore((state) => state.itemsDefinitionReady);
  const bungieDefinitionsReady = useGGStore((state) => state.bungieDefinitionsReady);
  const authenticated = useGGStore((state) => state.authenticated);
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);
  const { width } = useWindowDimensions();
  const SCREEN_WIDTH = width;
  const stateHydrated = useGGStore((state) => state.stateHydrated);
  const appReady = useGGStore((state) => state.appReady);

  useEffect(() => {
    if (SCREEN_WIDTH) {
      useGGStore.getState().setInventorySectionWidth(SCREEN_WIDTH);
    }
  }, [SCREEN_WIDTH]);

  useEffect(() => {
    if (authenticated === "NO-AUTHENTICATION" && stateHydrated) {
      if (navigationRef.current) {
        SplashScreen.hideAsync();
        navigationRef.current.navigate("Login");
      } else {
        console.error("No navigationRef");
      }
    } else if (authenticated === "AUTHENTICATED" && itemsDefinitionReady && bungieDefinitionsReady) {
      useGGStore.getState().loadCachedProfile();
      getFullProfile();
      useGGStore.getState().setLastRefreshTime();
      const intervalId = setInterval(refreshIfNeeded, 2000);

      return () => clearInterval(intervalId);
    }
  }, [authenticated, itemsDefinitionReady, bungieDefinitionsReady, stateHydrated]);

  return (
    <GestureHandlerRootView>
      {appReady && <StatusBar barStyle={"light-content"} />}
      <NavigationContainer ref={navigationRef} theme={navigationContainerTheme}>
        <App />
        <Toast />
      </NavigationContainer>
      <PortalHost />
    </GestureHandlerRootView>
  );
}

export default Root;
