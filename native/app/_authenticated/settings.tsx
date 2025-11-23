import Settings from "@/app/screens/Settings.tsx";
import { Stack } from "expo-router";

export default function SettingsScreen() {
  "use memo";
  return (
    <>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#1C1C1C",
          },
          headerTintColor: "white",
        }}
      />
      <Settings />
    </>
  );
}

