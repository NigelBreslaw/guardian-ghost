import { LOGO_DARK, LOGO_LIGHT } from "@/app/bungie/Common";
import { stateID } from "@/app/store/AuthenticationLogic.ts";
import { useGGStore } from "@/app/store/GGStore";
import { clientID, isLocalWeb, redirectURL } from "@/constants/env.ts";
import type { NavigationProp } from "@react-navigation/native";
import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

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

function startAuth(): void {
  function cancelLogin() {
    console.info("Failed to complete auth session");
    useGGStore.getState().cancelLogin();
  }

  const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${stateID}`;

  useGGStore.getState().startedLoginFlow();

  WebBrowser.openAuthSessionAsync(authURL, redirectURL)
    .then((result) => {
      if (result.type === "success") {
        // Used for Web and Android
        useGGStore.getState().createAuthenticatedAccount(result.url);
      } else if (result.type === "dismiss") {
        // iOS only on universal link callback
        if (Platform.OS === "android") {
          // User probably went back from the login webview without completing auth flow
          cancelLogin();
        }
      } else {
        // Used for all platforms
        cancelLogin();
      }
    })
    .catch((e) => {
      console.error("login issue?", e);
      cancelLogin();
    });
}

function LocalWebLogin() {
  const [localWebLoginText, setLocalWebLoginText] = useState("");
  const createAuthenticatedAccount = useGGStore((state) => state.createAuthenticatedAccount);

  return (
    <>
      <TextInput
        label="Paste URL"
        value={localWebLoginText}
        onChangeText={(localWebLoginText) => {
          setLocalWebLoginText(localWebLoginText);
        }}
      />
      <View style={styles.spacer} />
      <Button onPress={() => createAuthenticatedAccount(localWebLoginText)}>secret login</Button>
    </>
  );
}

export default function Login({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const colorScheme = useColorScheme();
  const authenticated = useGGStore((state) => state.authenticated);
  const createAuthenticatedAccount = useGGStore((state) => state.createAuthenticatedAccount);
  const url = useURL();

  const logoSource = colorScheme === "light" ? LOGO_LIGHT : LOGO_DARK;

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;

  useEffect(() => {
    if (authenticated === "AUTHENTICATED" || authenticated === "DEMO-MODE") {
      navigation.goBack();
    }
  }, [authenticated, navigation]);

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
        createAuthenticatedAccount(event.url);
      }
    };

    const listener = addEventListener("url", handleRedirect);

    return () => {
      listener.remove();
    };
  }, [createAuthenticatedAccount]);

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
        <Image source={logoSource} style={{ width: 100, height: 100 }} />
        <View style={{ marginTop: 20 }} />
        <Text style={{ ...themeTextStyle, fontSize: 50, fontWeight: "bold", letterSpacing: -2, lineHeight: 48 }}>
          {"Welcome to Guardian Ghost"}
        </Text>
        <View style={{ marginTop: 40 }} />
        <Text style={themeTextStyle}>To take your Destiny 2 experience to the next level, please login.</Text>
        <View style={{ marginTop: 20 }} />
        <Button
          mode="contained"
          disabled={authenticated === "LOGIN-FLOW"}
          onPressIn={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          onPress={() => {
            startAuth();
          }}
          style={{ alignSelf: "stretch" }}
          loading={authenticated === "LOGIN-FLOW"}
        >
          Login
        </Button>
        {isLocalWeb && <LocalWebLogin />}
        <View style={{ marginTop: 80 }} />
        <Button
          mode="outlined"
          disabled={authenticated === "DEMO-MODE"}
          onPressIn={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          onPress={() => {
            useGGStore.getState().setDemoMode();
          }}
          style={{ alignSelf: "center" }}
          loading={authenticated === "DEMO-MODE"}
        >
          Demo Mode
        </Button>
      </View>
    </SafeAreaView>
  );
}
