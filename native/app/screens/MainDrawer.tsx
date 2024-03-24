import DataService from "@/app/core/DataService.ts";
import { LOGO_DARK } from "@/app/inventory/Common.ts";
import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import AuthService from "@/authentication/AuthService.ts";
import { type DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
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
        DataService.getInventory();
      }}
    />
  );
}

const Tab = createMaterialBottomTabNavigator();

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const weaponsPageData = useGGStore((state) => state.weaponsPageData);
  const armorPageData = useGGStore((state) => state.armorPageData);
  const inventoryPageData = useGGStore((state) => state.inventoryPageData);

  const styles = StyleSheet.create({
    bar: {
      backgroundColor: "black",
      borderTopColor: "#2A1D38",
      borderTopWidth: StyleSheet.hairlineWidth,
      ...Platform.select({
        ios: {
          height: insets.bottom + 50,
        },
        default: {
          height: insets.bottom + 70,
        },
      }),
    },
  });

  return (
    <Tab.Navigator
      shifting={true}
      activeColor="white"
      activeIndicatorStyle={{ backgroundColor: "#303030", borderRadius: 5 }}
      inactiveColor="grey"
      barStyle={styles.bar}
    >
      <Tab.Screen
        name="tab-weapons"
        options={{
          tabBarLabel: "Weapons",
          tabBarIcon: "pistol",
        }}
      >
        {(props) => <InventoryPage {...props} inventoryPageData={weaponsPageData} />}
      </Tab.Screen>
      <Tab.Screen
        name="tab-armor"
        options={{
          tabBarLabel: "Armor",
          tabBarIcon: "tshirt-crew-outline",
        }}
      >
        {(props) => <InventoryPage {...props} inventoryPageData={armorPageData} />}
      </Tab.Screen>
      <Tab.Screen
        name="tab-inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: "diamond-stone",
        }}
      >
        {(props) => <InventoryPage {...props} inventoryPageData={inventoryPageData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();

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
            AuthService.logoutCurrentUser();
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
          headerRight: () => <RefreshButton />,
        }}
      />
    </Drawer.Navigator>
  );
}
