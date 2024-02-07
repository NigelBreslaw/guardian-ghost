import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

export default function App() {
  const url = Linking.useURL();

  useEffect(() => {
    // Do something with url
    console.log(url);
  }, [url]);

  // const openURL = async (url: string) => {
  //   if (Platform.OS === "ios") {
  //     // Open URL in Expo's WebBrowser on iOS
  //     console.log("Opening URL in WebBrowser");
  //     try {
  //       const result = await WebBrowser.openAuthSessionAsync(url, "https://guardianghost.com/auth", {
  //         preferEphemeralSession: false,
  //       });
  //       console.log(result);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   } else if (Platform.OS === "android") {
  //     // Open URL in the default system browser on Android
  //     Linking.openURL(url);
  //   }
  // };
  function openURL(url: string) {
    const params = {
      preferEphemeralSession: false,
    };

    console.log("Opening URL in WebBrowser");
    WebBrowser.openAuthSessionAsync(url, "https://guardianghost.com/auth", params).then((result) => {
      console.log(result);
    });
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#232526", "#66686a"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <Text style={{ color: "#fff" }}>Open up App.tsx to start working on your app!</Text>
      <Image
        style={{ width: 200, height: 200 }}
        contentFit="contain"
        source="https://d33wubrfki0l68.cloudfront.net/554c3b0e09cf167f0281fda839a5433f2040b349/ecfc9/img/header_logo.svg"
      />
      <Button
        title="Auth"
        onPress={() =>
          openURL("https://www.bungie.net/en/oauth/authorize?client_id=46250&response_type=code&reauth=true")
        }
      />
      <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>
        New Architecture: <Text style={{ fontWeight: "bold" }}>Enabled</Text>
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
