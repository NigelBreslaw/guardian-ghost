import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { LOGO_DARK } from "@/app/inventory/Common.ts";
import InventoryHeader from "@/app/screens/InventoryHeader.tsx";
import HomeScreen from "@/app/screens/InventoryPages";
import { useGGStore } from "@/app/store/GGStore.ts";
import { type DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function RefreshButton() {
  const refreshing = useGGStore((state) => state.refreshing);

  return (
    <IconButton
      icon={"refresh"}
      iconColor={"white"}
      loading={refreshing}
      onPress={() => {
        getFullProfile();
      }}
    />
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
  });

  return (
    <View style={styles.drawerContainer}>
      <View style={{ flex: 4 }}>
        <Image source={LOGO_DARK} style={{ width: 100, height: 100 }} />
        <Text style={styles.textDark}>Guardian Ghost</Text>
      </View>
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={() => {
            props.navigation.closeDrawer();
            logoutCurrentUser();
          }}
          style={{ alignSelf: "stretch" }}
        >
          Logout
        </Button>
      </View>
    </View>
  );
};

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        swipeEdgeWidth: 0,
      }}
    >
      <Drawer.Screen
        name="Inventory"
        component={HomeScreen}
        options={{
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
          headerBackground: InventoryHeader,
        }}
      />
    </Drawer.Navigator>
  );
}
