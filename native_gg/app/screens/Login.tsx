import { useEffect } from "react";
import { Platform, StyleSheet, Image, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NavigationProp } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import { addEventListener, useURL } from "expo-linking";
import { Button, ButtonSpinner, ButtonText } from "@gluestack-ui/themed";
import { useGlobalStateContext } from "@/state/GlobalState.tsx";
import AuthService from "@/authentication/AuthService.ts";

export default function Login({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const colorScheme = useColorScheme();
  const globalState = useGlobalStateContext();
  const url = useURL();

  const buttonColor = colorScheme === "light" ? "#3375de" : "#B4B4EA";
  const logoSource =
    colorScheme === "light" ? require("../../images/gg-logo-light.webp") : require("../../images/gg-logo-dark.webp");

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;

  useEffect(() => {
    if (globalState.appReady && globalState.authenticated) {
      navigation.goBack();
    }
  }, [globalState.appReady, globalState.authenticated, navigation]);

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
        AuthService.processURL(event.url);
      }
    };
    // If this view is being constructed then ensure the login button can be pressed
    AuthService.setLoggingIn(false);

    const listener = addEventListener("url", handleRedirect);

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (url) {
      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]);

  return (
    <SafeAreaView style={themeContainerStyle}>
      <View style={styles.container}>
        <View style={{ marginTop: 40 }} />
        <Image source={logoSource} style={{ width: 200, height: 200, alignSelf: "center" }} />
        <View style={{ marginTop: 40 }} />
        <Text style={{ ...themeTextStyle, fontSize: 50, fontWeight: "bold", letterSpacing: -2, lineHeight: 48 }}>
          Welcome to Guardian Ghost
        </Text>
        <View style={{ marginTop: 40 }} />
        <Text style={themeTextStyle}>To take your Destiny 2 experience to the next level, please login.</Text>
        <View style={{ marginTop: 20 }} />
        <Button
          size="xl"
          variant="outline"
          action="primary"
          isDisabled={globalState.loggingIn}
          isFocusVisible={false}
          onPress={() => {
            AuthService.startAuth();
          }}
          style={{ alignSelf: "stretch", borderColor: buttonColor }}
        >
          {globalState.loggingIn && <ButtonSpinner mr="$1" />}
          <ButtonText color={buttonColor}>Login</ButtonText>
        </Button>
        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainerLight: {
    flex: 1,
    backgroundColor: "#F2F5FC",
  },
  topContainerDark: {
    flex: 1,
    backgroundColor: "#171321",
  },
  textLight: {
    color: "black",
    fontSize: 22,
  },
  textDark: {
    color: "#F1EDFE",
    fontSize: 22,
  },
  container: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
  },
  imageContainer: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  spacer: {
    marginTop: 10,
  },
});
