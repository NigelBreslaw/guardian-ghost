import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "@/screens/Home";
import { Button } from "react-native-paper";
import AuthService from "@/authentication/AuthService.ts";
import { View } from "react-native";

const Drawer = createDrawerNavigator();

const drawerContent = () => {
  return (
    <View>
      <View style={{ marginTop: 100 }} />
      <Button
        mode="contained"
        // disabled={globalState.loggingIn}
        onPress={() => {
          AuthService.logoutCurrentUser();
        }}
        style={{ alignSelf: "stretch" }}
      >
        Logout
      </Button>
    </View>
  );
};

export function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={drawerContent}
      screenOptions={{
        swipeEdgeWidth: 0,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}
