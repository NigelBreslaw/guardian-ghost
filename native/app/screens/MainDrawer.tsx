import StorageGG from "@/app/storage/StorageGG.ts";
import AuthService from "@/authentication/AuthService.ts";
import { type DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { armorPageBuckets, inventoryPageBuckets, weaponsPageBuckets } from "@/app/inventory/Common.ts";

const Tab = createMaterialBottomTabNavigator();

function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      shifting={true}
      activeColor="white"
      activeIndicatorStyle={{ backgroundColor: "#303030", borderRadius: 5 }}
      inactiveColor="grey"
      barStyle={{
        backgroundColor: "black",
        height: insets.bottom + 70,
        borderTopColor: "#2A1D38",
        borderTopWidth: StyleSheet.hairlineWidth,
      }}
    >
      <Tab.Screen
        name="tab-weapons"
        options={{
          tabBarLabel: "Weapons",
          tabBarIcon: "pistol",
        }}
      >
        {(props) => <InventoryPage {...props} itemBuckets={weaponsPageBuckets} />}
      </Tab.Screen>
      <Tab.Screen
        name="tab-armor"
        options={{
          tabBarLabel: "Armor",
          tabBarIcon: "tshirt-crew-outline",
        }}
      >
        {(props) => <InventoryPage {...props} itemBuckets={armorPageBuckets} />}
      </Tab.Screen>
      <Tab.Screen
        name="tab-inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: "diamond-stone",
        }}
      >
        {(props) => <InventoryPage {...props} itemBuckets={inventoryPageBuckets} />}
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
      flexDirection: "column-reverse",
    },
  });

  return (
    <View style={styles.drawerContainer}>
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
      <View style={{ marginTop: 40 }} />
      <Button
        mode="contained"
        onPress={() => {
          props.navigation.closeDrawer();
          const j = JSON.parse("{}");
          StorageGG.setData(j, "item_definition", "deleteDb");
        }}
        style={{ alignSelf: "stretch" }}
      >
        Delete DB
      </Button>
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
            backgroundColor: "darkgrey",
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
        }}
      />
    </Drawer.Navigator>
  );
}
