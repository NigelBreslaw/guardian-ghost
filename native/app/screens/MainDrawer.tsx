import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import type { DestinyItem } from "@/app/bungie/Types.ts";
import { LOGO_DARK, REFRESH_ICON } from "@/app/bungie/Common";
import InventoryHeader from "@/app/screens/InventoryHeader.tsx";
import InventoryPages from "@/app/screens/InventoryPages";
import { useGGStore } from "@/app/store/GGStore.ts";
import { type DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getGuardianClassType } from "@/app/utilities/Helpers.ts";
import { Image } from "expo-image";
import Spinner from "@/app/components/Spinner.tsx";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    alignSelf: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 20,
    height: 20,
    alignSelf: "center",
  },
  spinner: {
    width: 20,
    height: 20,
    alignSelf: "center",
    position: "absolute",
  },
});

function RefreshButton() {
  const refreshing = useGGStore((state) => state.refreshing);

  return (
    <TouchableWithoutFeedback onPress={() => getFullProfile()}>
      <View style={styles.iconButton}>
        <Image source={REFRESH_ICON} style={[styles.iconImage, { opacity: refreshing ? 0 : 1 }]} />
        {refreshing && (
          <View style={styles.spinner}>
            <Spinner size={52} />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

function CharacterHeaderButtons() {
  const ggCharacters = useGGStore((state) => state.ggCharacters);
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const scale = 0.4;
  const originalHeight = 96;
  const borderRadius = 15;
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

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();
  const logoutCurrentUser = useGGStore((state) => state.logoutCurrentUser);

  const styles = StyleSheet.create({
    drawerContainer: {
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 20,
      paddingLeft: insets.left + 20,
      paddingRight: insets.right + 20,
      flex: 1,
    },
    bottomContainer: {
      flex: 1,
      flexDirection: "column-reverse",
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

  return (
    <View style={styles.drawerContainer}>
      <View style={{ flex: 4 }}>
        <Image source={LOGO_DARK} style={{ width: 100, height: 100 }} />
        <Text style={styles.textDark}>Guardian Ghost</Text>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.closeDrawer();
            logoutCurrentUser();
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
  );
};

export default function MainDrawer() {
  const ggGuardians = useGGStore((state) => state.ggCharacters);
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const guardianClassType = getGuardianClassType(ggGuardians[currentListIndex]?.guardianClassType);
  const navigator = useNavigation();
  const selectedItem = useGGStore((state) => state.selectedItem);

  function activateSheet(item: DestinyItem) {
    navigator.navigate("BottomSheet", { item });
  }

  useEffect(() => {
    if (selectedItem) {
      activateSheet(selectedItem);
    }
  }, [selectedItem, activateSheet]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        swipeEdgeWidth: 0,
      }}
    >
      <Drawer.Screen
        name="Inventory"
        component={InventoryPages}
        options={{
          title: `${guardianClassType}`,
          drawerType: "back",
          drawerStyle: {
            backgroundColor: "black",
          },
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
          headerRight: RefreshButton,
          headerTitle: CharacterHeaderButtons,
          headerBackground: InventoryHeader,
        }}
      />
    </Drawer.Navigator>
  );
}
