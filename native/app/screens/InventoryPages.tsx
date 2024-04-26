import WeaponsPage from "@/app/screens/WeaponsPage.tsx";
import ArmorPage from "@/app/screens/ArmorPage.tsx";
import GeneralPage from "@/app/screens/GeneralPage.tsx";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function InventoryPages() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          switch (route.name) {
            case "tab-weapons":
              return <MaterialCommunityIcons name="sword-cross" size={20} color={focused ? "white" : "gray"} />;
            case "tab-armor":
              return (
                <MaterialCommunityIcons
                  name="shield-link-variant-outline"
                  size={20}
                  color={focused ? "white" : "gray"}
                />
              );
            case "tab-inventory":
              return <Ionicons name={"diamond-sharp"} size={20} color={focused ? "white" : "gray"} />;
          }
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="tab-weapons"
        options={{
          tabBarLabel: "Weapons",
        }}
        component={WeaponsPage}
      />
      <Tab.Screen
        name="tab-armor"
        options={{
          tabBarLabel: "Armor",
        }}
        component={ArmorPage}
      />
      <Tab.Screen
        name="tab-inventory"
        options={{
          tabBarLabel: "Inventory",
        }}
        component={GeneralPage}
      />
    </Tab.Navigator>
  );
}

export default React.memo(InventoryPages);
