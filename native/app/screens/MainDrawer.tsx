import { DrawerContentComponentProps, createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "@/screens/Home";
import { Button } from "react-native-paper";
import AuthService from "@/authentication/AuthService.ts";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20,
        flex: 1,
        flexDirection: "column-reverse",
      }}
    >
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
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerStyle: {
            backgroundColor: "#17101F",
          },
          headerTintColor: "white",
        }}
      />
    </Drawer.Navigator>
  );
}
