import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Text, View } from "react-native";
import { useGlobalStateContext } from "./state/GlobalState";
import Login from "./screens/Login";
import { useEffect } from "react";
import AuthService from "./authentication/AuthService";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 30 }}>This is the home screen!</Text>
      <Button title="Logout" onPress={() => AuthService.logoutCurrentUser()} />
    </View>
  );
}

function DetailsScreen() {
  return (
    <View>
      <Text>Details</Text>
    </View>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
// function ModalScreen({ navigation }: { navigation: any }) {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text style={{ fontSize: 30 }}>This is a modal!</Text>
//       <Button onPress={() => navigation.goBack()} title="Dismiss" />
//     </View>
//   );
// }

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
        <RootStack.Screen name="Details" component={DetailsScreen} />
      </RootStack.Group>
      <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
        <RootStack.Screen name="Login" component={Login} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
