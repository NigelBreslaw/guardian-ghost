import { DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "@/screens/Home";
import { Button } from "react-native-paper";
import AuthService from "@/authentication/AuthService.ts";
import { View } from "react-native";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <View>
      <View style={{ marginTop: 100 }} />
      <Button
        mode="contained"
        // disabled={globalState.loggingIn}
        onPress={() => {
          props.navigation.closeDrawer();
          AuthService.logoutCurrentUser();
        }}
        style={{ alignSelf: "stretch" }}
      >
        Logout
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
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}
