import { LOGO_DARK, LOGO_LIGHT } from "@/app/inventory/Common.ts";
import { processURL, startAuth } from "@/app/store/AuthenticationLogic.ts";
import { useGGStore } from "@/app/store/GGStore";
import { isLocalWeb } from "@/constants/env.ts";
import type { NavigationProp } from "@react-navigation/native";
import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function LocalWebLogin() {
  const [localWebLoginText, setLocalWebLoginText] = useState("");

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
      <Button onPress={() => processURL(localWebLoginText)}>secret login</Button>
    </>
  );
}

export default function Login({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const colorScheme = useColorScheme();
  const initComplete = useGGStore((state) => state.initComplete);
  const authenticated = useGGStore((state) => state.authenticated);
  const url = useURL();

  const logoSource = colorScheme === "light" ? LOGO_LIGHT : LOGO_DARK;

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;

  useEffect(() => {
    if (initComplete && authenticated === "AUTHENTICATED") {
      navigation.goBack();
    }
  }, [initComplete, authenticated, navigation]);

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
        processURL(event.url);
      }
    };

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
          // disabled={loggingIn}
          onPress={() => {
            startAuth();
          }}
          style={{ alignSelf: "stretch" }}
          // loading={loggingIn}
        >
          Login
        </Button>
        {isLocalWeb && <LocalWebLogin />}
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
