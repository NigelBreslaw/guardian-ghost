import { type DrawerContentComponentProps, createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import * as SplashScreen from "expo-splash-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "@/app/UI/Text.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import { ELLIPSES_HORIZONTAL, LOGO_DARK, SEARCH_ICON } from "@/app/utilities/Constants.ts";
import InventoryHeader from "@/app/inventory/pages/InventoryHeader.tsx";
import InventoryPages from "@/app/inventory/pages/InventoryPages.tsx";
import Spinner from "@/app/UI/Spinner.tsx";
import SearchView from "@/app/inventory/pages/SearchView.tsx";
import Settings from "@/app/screens/Settings.tsx";
import CharacterHeaderButtons from "@/app/UI/CharacterHeaderButtons.tsx";
import { Pressable } from "react-native-gesture-handler";

function MenuButton() {
  "use memo";
  const refreshing = useGGStore((state) => state.refreshing);

  return (
    <Pressable
      style={({ pressed }) => (pressed ? styles.highlight : styles.pressable)}
      onPress={() => useGGStore.getState().showInventoryMenu(true)}
    >
      <View style={styles.iconButton}>
        {refreshing && (
          <View style={styles.spinner}>
            <Spinner size={70} />
          </View>
        )}
        <Image source={ELLIPSES_HORIZONTAL} style={{ width: 24, height: 24 }} />
      </View>
    </Pressable>
  );
}

export type GGDrawerType = {
  Inventory: undefined;
  Search: undefined;
  Settings: undefined;
  DropdownMenu: undefined;
};

const Drawer = createDrawerNavigator<GGDrawerType>();

function CustomDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  "use memo";
  const insets = useSafeAreaInsets();

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
          focused={state.index === 0}
          onPress={() => navigation.navigate("Inventory")}
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
          focused={state.index === 1}
          activeBackgroundColor="#ffffff20"
          onPress={() => navigation.navigate("Search")}
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
          focused={state.index === 2}
          onPress={() => navigation.navigate("Settings")}
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
            onPress={() => {
              navigation.closeDrawer();
              useGGStore.getState().logoutCurrentUser();
            }}
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

export default function MainDrawer() {
  "use memo";

  const appReady = useGGStore((state) => state.appReady);

  if (!appReady) {
    return null;
  }
  SplashScreen.hideAsync();

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        swipeEdgeWidth: 0,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="Inventory"
        component={InventoryPages}
        options={{
          headerTintColor: "white",
          headerRight: MenuButton,
          headerTitle: CharacterHeaderButtons,
          headerBackground: InventoryHeader,
        }}
      />
      <Drawer.Screen
        name="Search"
        component={SearchView}
        options={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#1C1C1C",
          },
          headerTintColor: "white",
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#1C1C1C",
          },
          headerTintColor: "white",
        }}
      />
    </Drawer.Navigator>
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
  },
  top: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
  },
  iconButton: {
    width: 30,
    height: 30,
    marginRight: 10,
    justifyContent: "center",
    alignContent: "center",
  },
  iconImage: {
    width: 10,
    height: 10,
    alignSelf: "center",
    position: "absolute",
  },
  spinner: {
    alignSelf: "center",
    position: "absolute",
    opacity: 0.4,
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
