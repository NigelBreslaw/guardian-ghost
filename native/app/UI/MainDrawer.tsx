import { type DrawerContentComponentProps, createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGGStore } from "@/app/store/GGStore.ts";
import { getGuardianClassType } from "@/app/utilities/Helpers.ts";
import { LOGO_DARK, SEARCH_ICON } from "@/app/utilities/Constants.ts";
import InventoryHeader from "@/app/inventory/pages/InventoryHeader.tsx";
import InventoryPages from "@/app/inventory/pages/InventoryPages.tsx";
import SearchView from "@/app/inventory/pages/SearchView.tsx";
import { MyMenu } from "@/app/components/menu.tsx";

function CharacterHeaderButtons() {
  "use memo";
  const ggCharacters = useGGStore((state) => state.ggCharacters);
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const scale = 0.4;
  const originalHeight = 96;
  const borderRadius = 7;
  const transferHeight = originalHeight * scale;

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {ggCharacters.map((ggCharacter, index) => {
        return (
          <TouchableOpacity
            onPress={() => useGGStore.getState().setJumpToIndex({ index, animate: true })}
            key={ggCharacter.characterId}
          >
            <View
              style={{
                width: transferHeight,
                height: transferHeight,
                borderRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  transformOrigin: "top left",
                  transform: [{ scale: scale }],
                }}
              >
                <Image source={ggCharacter.emblemPath} style={{ width: 96, height: 96 }} />
              </View>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderRadius,
                  borderWidth: 1,
                  borderColor: index === currentListIndex ? "white" : "#5B5B5B",
                }}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  "use memo";
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4, paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.top}>
        <DrawerItem
          label="Inventory"
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
      </View>

      <View style={styles.bottom}>
        <Image source={LOGO_DARK} style={{ width: 100, height: 100 }} />
        <Text style={styles.textDark}>Guardian Ghost</Text>
        <View>
          {__DEV__ && (
            <TouchableOpacity
              onPress={() => {
                useGGStore.getState().clearCache();
              }}
            >
              <View style={styles.button}>
                <Text style={styles.buttonText}>Clear Cache</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
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
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MainDrawer() {
  "use memo";
  const ggGuardians = useGGStore((state) => state.ggCharacters);
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const guardianClassType = getGuardianClassType(ggGuardians[currentListIndex]?.guardianClassType);

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
          title: `${guardianClassType}`,

          sceneContainerStyle: {
            backgroundColor: "#17101F",
          },
          headerStyle: {
            backgroundColor: "#17101F",
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "#2A1D38",
          },
          headerTintColor: "white",
          drawerActiveBackgroundColor: "blue",
          headerRight: MyMenu,
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
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
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
