import { DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "@/screens/Home";
import { Button } from "react-native-paper";
import AuthService from "@/authentication/AuthService.ts";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StorageGG from "@/app/storage/StorageGG.ts";

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
          const j = JSON.parse("undefined");
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
        name="Home"
        component={HomeScreen}
        options={{
          drawerType: "back",
          headerStyle: {
            backgroundColor: "#17101F",
          },
          headerTintColor: "white",
        }}
      />
    </Drawer.Navigator>
  );
}
