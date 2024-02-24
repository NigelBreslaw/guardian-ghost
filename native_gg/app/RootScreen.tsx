import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Text, View, useColorScheme, StyleSheet } from "react-native";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { useGlobalStateContext } from "./state/GlobalState.tsx";
import Login from "@/screens/Login.tsx";
import { useEffect } from "react";
import AuthService from "@/authentication/AuthService.tsx";

function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const colorScheme = useColorScheme();

  const themeColor = colorScheme === "light" ? "#F2F5FC" : "#171321";
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;
  const buttonColor = colorScheme === "light" ? "#3375de" : "#B4B4EA";

  return (
    <View style={{ ...styles.topContainer, backgroundColor: themeColor }}>
      <View style={{ marginTop: 100 }} />
      <Text style={{ ...themeTextStyle, fontSize: 50, fontWeight: "bold", letterSpacing: -2, lineHeight: 48 }}>
        Home Screen
      </Text>
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
      {globalState.loggingIn && (
        <View>
          <Text style={{ ...themeTextStyle, fontSize: 30 }}>
            {`Account Status: ${globalState.currentAccount !== null ? "Yes" : "Waiting..."}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
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
