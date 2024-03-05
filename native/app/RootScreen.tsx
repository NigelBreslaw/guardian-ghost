import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native";
import { useGlobalStateContext } from "@/state/GlobalState.tsx";
import Login from "@/screens/Login.tsx";
import MainDrawer from "@/screens/MainDrawer.tsx";

const RootStack = createStackNavigator();

export default function RootScreen() {
  const globalState = useGlobalStateContext();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const themeBackgroundColor = colorScheme === "light" ? "white" : "#171321";
  const themeTextColor = colorScheme === "light" ? "black" : "white";

  useEffect(() => {
    if (globalState.initComplete && !globalState.authenticated) {
      navigation.navigate("Login" as never);
    }
  }, [globalState.authenticated, globalState.initComplete, navigation]);

  return (
    <RootStack.Navigator>
      <RootStack.Group>
        <RootStack.Screen
          name="Root"
          component={MainDrawer}
          options={{
            headerShown: false,
          }}
        />
      </RootStack.Group>
      <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
        <RootStack.Screen name="Login" component={Login} options={{ title: "Login" }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
