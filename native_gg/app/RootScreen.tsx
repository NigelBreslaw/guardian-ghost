import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Text, View, useColorScheme, StyleSheet } from "react-native";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { useGlobalStateContext } from "./state/GlobalState";
import Login from "./screens/Login";
import { useEffect } from "react";
import AuthService from "./authentication/AuthService";

function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const colorScheme = useColorScheme();

  const themeColor = colorScheme === "light" ? "#F2F5FC" : "#171321";
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;
  const buttonColor = colorScheme === "light" ? "#3375de" : "#B4B4EA";

  return (
    <View style={{ ...styles.topContainer, backgroundColor: themeColor }}>
      <Text style={{ ...themeTextStyle, fontSize: 30 }}>This is the home screen!</Text>
      <Button
        size="xl"
        variant="outline"
        action="primary"
        isFocusVisible={false}
        onPress={() => {
          AuthService.logoutCurrentUser();
        }}
        style={{ alignSelf: "stretch", borderColor: buttonColor }}
      >
        <ButtonText color={buttonColor}>Logout</ButtonText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "center",
  },
  textLight: {
    color: "black",
    fontSize: 22,
  },
  textDark: {
    color: "#F1EDFE",
    fontSize: 22,
  },
});

const RootStack = createStackNavigator();

export default function RootScreen() {
  const globalState = useGlobalStateContext();
  const navigation = useNavigation();

  const colorScheme = useColorScheme();

  const themeBackgroundColor = colorScheme === "light" ? "white" : "#171321";
  const themeTextColor = colorScheme === "light" ? "black" : "white";

  useEffect(() => {
    if (globalState.appReady && !globalState.authenticated) {
      console.log("not authenticated so opening login");
      navigation.navigate("Login" as never);
    }
  }, [globalState.authenticated, globalState.appReady, navigation]);

  return (
    <RootStack.Navigator>
      <RootStack.Group>
        <RootStack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerStyle: {
              backgroundColor: themeBackgroundColor,
            },
            headerTitleStyle: {
              color: themeTextColor,
              fontWeight: "bold",
            },
          }}
        />
      </RootStack.Group>
      <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
        <RootStack.Screen name="Login" component={Login} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
