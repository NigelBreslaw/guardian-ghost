import SearchView from "@/app/inventory/pages/SearchView.tsx";
import { Stack } from "expo-router";

export default function SearchScreen() {
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
      <SearchView />
    </>
  );
}
