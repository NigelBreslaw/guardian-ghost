import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@rn-primitives/portal";
import Toast from "react-native-toast-message";
import * as NavigationBar from "expo-navigation-bar";
import { Slot, useRouter, useSegments } from "expo-router";

import { BUNGIE_MANIFEST_URL, CUSTOM_MANIFEST_URL, getFullProfile } from "@/app/bungie/BungieApi.ts";
import { getJsonBlob } from "@/app/utilities/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { bungieManifestSchema } from "@/app/core/ApiResponse.ts";
import "@/global.css";

// Enable screens for better performance
import { enableScreens, enableFreeze } from "react-native-screens";
enableScreens();
enableFreeze(true);

SplashScreen.preventAutoHideAsync();
if (Platform.OS !== "web") {
  const { Appearance } = require("react-native");
  Appearance.setColorScheme("dark");
}

let customDownloadAttempts = 0;
async function getCustomItemDefinition() {
  try {
    const customManifest = getJsonBlob(CUSTOM_MANIFEST_URL);
    const manifest = await customManifest;
    const { parse, object, string } = await import("valibot");
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
    const { parse } = await import("valibot");
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

let initCalled = false;
async function init() {
  if (initCalled) {
    return; // Prevent multiple calls during reload
  }
  initCalled = true;
  try {
    const startupTime = performance.now();
    useGGStore.getState().setAppStartupTime(startupTime);
    await useGGStore.getState().initAuthentication();
  } catch (error) {
    console.error("[RootLayout] Error during init:", error);
    initCalled = false; // Allow retry on error
  }
}

function refreshIfNeeded() {
  const lastRefresh = useGGStore.getState().lastRefreshTime;
  const now = performance.now();
  if (now - lastRefresh > 35000) {
    getFullProfile();
  }
}

export default function RootLayout() {
  "use memo";

  const authenticated = useGGStore((state) => state.authenticated);
  const { width } = useWindowDimensions();
  const SCREEN_WIDTH = width;
  const stateHydrated = useGGStore((state) => state.stateHydrated);
  const appReady = useGGStore((state) => state.appReady);
  const router = useRouter();
  const segments = useSegments();

  // Initialize authentication on mount (not at module load time)
  useEffect(() => {
    init();
  }, []);

  // Global auth state listener - safety net for logout navigation
  useEffect(() => {
    if (stateHydrated && authenticated === "NO-AUTHENTICATION") {
      // User logged out - ensure we're not on authenticated routes
      const currentRoute = segments[0];
      if (currentRoute === "_authenticated") {
        router.replace("/sign-in");
      }
    }
  }, [authenticated, stateHydrated, segments, router]);

  useEffect(() => {
    async function setAndroidStatusBarColor() {
      await NavigationBar.setBackgroundColorAsync("#17101F");
    }
    if (Platform.OS === "android") {
      setAndroidStatusBarColor();
    }
  }, []);

  useEffect(() => {
    if (SCREEN_WIDTH) {
      useGGStore.getState().setInventorySectionWidth(SCREEN_WIDTH);
    }
  }, [SCREEN_WIDTH]);

  // Handle authenticated app initialization
  useEffect(() => {
    if (authenticated === "AUTHENTICATED" && appReady) {
      useGGStore.getState().loadCachedProfile();
      useGGStore.getState().setLastRefreshTime();
      getFullProfile();
      const intervalId = setInterval(refreshIfNeeded, 2000);
      return () => clearInterval(intervalId);
    }
  }, [authenticated, appReady]);

  useEffect(() => {
    async function initDefinitions() {
      if (useGGStore.getState().previousDefinitionsSuccessfullyLoaded) {
        useGGStore.getState().fastLoadDefinitions();
        // pause for 200ms to allow the definitions to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getCustomItemDefinition();
        getBungieDefinitions();
      } else {
        getCustomItemDefinition();
        getBungieDefinitions();
      }
    }
    if (stateHydrated) {
      initDefinitions();
    }
  }, [stateHydrated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {stateHydrated ? (
        <>
          <Slot />
          <Toast />
          <PortalHost />
        </>
      ) : (
        /* Waiting for hydration */
        null
      )}
    </GestureHandlerRootView>
  );
}
