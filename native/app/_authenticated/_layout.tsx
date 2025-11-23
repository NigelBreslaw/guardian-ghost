import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useGGStore } from "@/app/store/GGStore.ts";

export default function AuthenticatedLayout() {
  "use memo";

  const appReady = useGGStore((state) => state.appReady);

  console.log("[AuthenticatedLayout] Rendering, appReady:", appReady);

  if (!appReady) {
    console.log("[AuthenticatedLayout] Showing loading - waiting for appReady");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#17101F" }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  console.log("[AuthenticatedLayout] Rendering Stack");
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide stack header - drawers/stacks handle their own headers
      }}
    >
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details"
        // Remove headerShown: false - let child Stack control its own header
      />
    </Stack>
  );
}
