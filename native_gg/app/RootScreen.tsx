import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Text, View } from "react-native";
import { useGlobalStateContext } from "./state/GlobalState";
import Login from "./screens/Login";
import { useEffect } from "react";
import AuthService from "./authentication/AuthService";

function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 30 }}>This is the home screen!</Text>
      <Button title="Logout" onPress={() => AuthService.logoutCurrentUser()} />
    </View>
  );
}

const RootStack = createStackNavigator();

export default function RootScreen() {
  const globalState = useGlobalStateContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (globalState.appReady && !globalState.authenticated) {
      console.log("not authenticated so opening login");
      navigation.navigate("Login" as never);
    }
  }, [globalState.authenticated, globalState.appReady, navigation]);

  return (
    <RootStack.Navigator>
      <RootStack.Group>
        <RootStack.Screen name="Home" component={HomeScreen} />
      </RootStack.Group>
      <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
        <RootStack.Screen name="Login" component={Login} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
