import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#17101F",
        },
        headerTintColor: "white",
        presentation: "card", // Use card presentation for slide animation
        animation: Platform.OS === "ios" ? "default" : "slide_from_right", // Platform-specific animation
      }}
    >
      <Stack.Screen
        name="[itemId]"
        options={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: "#17101F",
          },
          headerTintColor: "white",
        }}
      />
    </Stack>
  );
}
