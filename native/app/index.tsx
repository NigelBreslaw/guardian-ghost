import { useEffect } from "react";
import { useRouter, Redirect } from "expo-router";
import { useGGStore } from "@/app/store/GGStore.ts";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  "use memo";
  const router = useRouter();
  const authenticated = useGGStore((state) => state.authenticated);
  const stateHydrated = useGGStore((state) => state.stateHydrated);

  // Debug logging
  useEffect(() => {
    console.log("[Index] State:", {
      stateHydrated,
      authenticated,
    });
  }, [stateHydrated, authenticated]);

  useEffect(() => {
    console.log("[Index] useEffect triggered:", {
      stateHydrated,
      authenticated,
    });

    if (!stateHydrated) {
      console.log("[Index] Waiting for stateHydrated...");
      return;
    }

    // Redirect based on authentication state
    if (authenticated === "NO-AUTHENTICATION") {
      console.log("[Index] Redirecting to /sign-in");
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
      router.replace("/sign-in");
    } else if (authenticated === "AUTHENTICATED") {
      console.log("[Index] Redirecting to /_authenticated/(tabs)/weapons");
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
      router.replace("/_authenticated/(tabs)/weapons");
    } else {
      console.log("[Index] Still initializing, authenticated state:", authenticated);
    }
    // If still INITIALIZING, wait - initAuthentication is still running
  }, [authenticated, stateHydrated, router]);

  // Show redirect component while waiting
  console.log("[Index] Rendering, stateHydrated:", stateHydrated, "authenticated:", authenticated);

  if (!stateHydrated) {
    console.log("[Index] Returning null - waiting for hydration");
    return null;
  }

  if (authenticated === "NO-AUTHENTICATION") {
    console.log("[Index] Rendering Redirect to /sign-in");
    return <Redirect href="/sign-in" />;
  }

  if (authenticated === "AUTHENTICATED") {
    console.log("[Index] Rendering Redirect to /_authenticated/(tabs)/weapons");
    return <Redirect href="/_authenticated/(tabs)/weapons" />;
  }

  // Still initializing - don't render anything
  console.log("[Index] Returning null - still initializing");
  return null;
}
