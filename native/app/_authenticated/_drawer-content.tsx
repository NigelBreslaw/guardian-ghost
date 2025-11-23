import { type DrawerContentComponentProps, DrawerItem } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useSegments } from "expo-router";
import { Pressable } from "react-native-gesture-handler";

import Text from "@/app/UI/Text.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import { LOGO_DARK, SEARCH_ICON } from "@/app/utilities/Constants.ts";

export default function CustomDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  "use memo";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  // Determine if we're on tabs (Inventory) route
  const isOnTabsRoute = segments.includes("(tabs)");
  const isOnSearchRoute = segments[segments.length - 1] === "search";
  const isOnSettingsRoute = segments[segments.length - 1] === "settings";

  const handleInventoryPress = () => {
    navigation.closeDrawer();
    // Navigate to weapons tab (default inventory tab)
    router.push("/_authenticated/(tabs)/weapons");
  };

  const handleSearchPress = () => {
    navigation.closeDrawer();
    router.push("/_authenticated/search");
  };

  const handleSettingsPress = () => {
    navigation.closeDrawer();
    router.push("/_authenticated/settings");
  };

  const handleLogout = async () => {
    navigation.closeDrawer();
    await useGGStore.getState().logoutCurrentUser();
    // Navigate to sign-in immediately after logout
    router.replace("/sign-in");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4, paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.top}>
        <DrawerItem
          label={({ color }) => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={{ color }}>{"Inventory"}</Text>
            </View>
          )}
          activeTintColor="white"
          inactiveTintColor="grey"
          activeBackgroundColor="#ffffff20"
          focused={isOnTabsRoute}
          onPress={handleInventoryPress}
        />
        <DrawerItem
          label={({ focused, color }) => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={{ color }}>{"Search"}</Text>
              <Image source={SEARCH_ICON} style={{ width: 20, height: 20, opacity: focused ? 1 : 0.4 }} />
            </View>
          )}
          activeTintColor="white"
          inactiveTintColor="grey"
          focused={isOnSearchRoute}
          activeBackgroundColor="#ffffff20"
          onPress={handleSearchPress}
        />
        <DrawerItem
          label={({ color }) => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={{ color }}>{"Settings"}</Text>
            </View>
          )}
          activeTintColor="white"
          inactiveTintColor="grey"
          activeBackgroundColor="#ffffff20"
          focused={isOnSettingsRoute}
          onPress={handleSettingsPress}
        />
      </View>

      <View style={styles.bottom}>
        <Image source={LOGO_DARK} style={{ width: 100, height: 100 }} />
        <Text style={styles.textDark}>Guardian Ghost</Text>
        <View>
          {__DEV__ && (
            <Pressable
              style={({ pressed }) => (pressed ? styles.highlight : styles.pressable)}
              onPress={() => {
                useGGStore.getState().clearCache();
              }}
            >
              <View style={styles.button}>
                <Text style={styles.buttonText}>Clear Cache</Text>
              </View>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => (pressed ? styles.highlight : styles.pressable)}
            onPress={handleLogout}
            onPressIn={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>Logout</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  highlight: {
    opacity: 0.5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  container: {
    flex: 1,
    height: "100%",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#17101F",
  },
  top: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
  },
  textDark: {
    color: "#F1EDFE",
    fontSize: 50,
    fontWeight: "bold",
    letterSpacing: -2,
    lineHeight: 48,
  },
  button: {
    width: "100%",
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6750A4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    includeFontPadding: false,
  },
});
