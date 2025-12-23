import { Stack, useRouter } from "expo-router";
import { Platform, Pressable } from "react-native";
import { ChevronLeft, ArrowLeft } from "lucide-react-native";

function BackButton() {
  "use memo";
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: Platform.OS === "ios" ? 0 : 16,
        paddingRight: 16,
      })}
    >
      {Platform.OS === "ios" ? <ChevronLeft size={28} color="white" /> : <ArrowLeft size={24} color="white" />}
    </Pressable>
  );
}

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // Explicitly show header
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#17101F",
        },
        headerTintColor: "white",
        presentation: "card", // Use card presentation for slide animation
        animation: Platform.OS === "ios" ? "default" : "slide_from_right", // Platform-specific animation
        // Use custom back button for iOS
        ...(Platform.OS === "ios" && {
          headerLeft: () => <BackButton />,
        }),
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
          // Use custom back button for iOS
          ...(Platform.OS === "ios" && {
            headerLeft: () => <BackButton />,
          }),
        }}
      />
    </Stack>
  );
}
