import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useURL } from "expo-linking";
import { useGGStore } from "@/app/store/GGStore.ts";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

export default function AuthCallback() {
  "use memo";
  const params = useLocalSearchParams<{ code?: string; state?: string }>();
  const url = useURL(); // Get the full URL that triggered this route
  const router = useRouter();
  const createAuthenticatedAccount = useGGStore((state) => state.createAuthenticatedAccount);
  const authenticated = useGGStore((state) => state.authenticated);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return; // Prevent double processing

    // Check if authentication already succeeded (might have been processed by sign-in component's event listener)
    if (authenticated === "AUTHENTICATED" || authenticated === "DEMO-MODE") {
      console.log("[AuthCallback] Authentication already succeeded, redirecting");
      setProcessed(true);
      router.replace("/_authenticated/(tabs)/weapons");
      return;
    }

    console.log("[AuthCallback] Received params:", params);
    console.log("[AuthCallback] Full URL:", url);

    // Prefer using the full URL if available, otherwise construct from params
    let callbackURL: string;

    if (url?.includes("code=") && url.includes("state=")) {
      // Use the full URL from expo-linking
      callbackURL = url;
      console.log("[AuthCallback] Using full URL from expo-linking");
    } else if (params.code && params.state) {
      // Fallback: construct URL from query params
      callbackURL = `guardianghost://auth?code=${encodeURIComponent(params.code)}&state=${encodeURIComponent(params.state)}`;
      console.log("[AuthCallback] Constructed URL from params");
    } else {
      console.error("[AuthCallback] Missing OAuth parameters. Params:", params, "URL:", url);
      setError("Invalid OAuth callback - missing parameters");
      setProcessed(true);
      // Redirect to sign-in after a delay
      setTimeout(() => {
        router.replace("/sign-in");
      }, 2000);
      return;
    }

    console.log("[AuthCallback] Processing OAuth callback:", callbackURL);

    // Dismiss auth session on iOS if needed
    if (Platform.OS === "ios") {
      WebBrowser.dismissAuthSession();
    }

    // Process the OAuth callback
    setProcessed(true);
    try {
      createAuthenticatedAccount(callbackURL);
    } catch (err) {
      console.error("[AuthCallback] Error processing OAuth callback:", err);
      setError("Failed to process authentication");
      setTimeout(() => {
        router.replace("/sign-in");
      }, 2000);
    }
  }, [params, url, createAuthenticatedAccount, router, processed, authenticated]);

  // Redirect to authenticated routes once authentication succeeds
  useEffect(() => {
    if (authenticated === "AUTHENTICATED" || authenticated === "DEMO-MODE") {
      console.log("[AuthCallback] Authentication successful, redirecting to authenticated routes");
      router.replace("/_authenticated/(tabs)/weapons");
    }
  }, [authenticated, router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.redirectText}>Redirecting to sign-in...</Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.text}>Processing authentication...</Text>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#17101F",
    padding: 20,
  },
  text: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 10,
    fontSize: 16,
    textAlign: "center",
  },
  redirectText: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
  },
});
