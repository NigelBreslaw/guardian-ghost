import { StatusBar } from "expo-status-bar";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";

export default function App() {
  const url = Linking.useURL();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (url) {
      const { hostname, path, queryParams } = Linking.parse(url);
      console.log("hostname", hostname, "path", path, "queryParams", queryParams);

      if (queryParams?.code) {
        setToken(queryParams.code.toString());
      }

      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
      }
    }
  }, [url]);

  function openURL(url: string) {
    const params = {
      preferEphemeralSession: false,
    };

    console.log("Opening URL in WebBrowser");
    WebBrowser.openAuthSessionAsync(url, null, params);
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
        Auth token: <Text style={{ fontWeight: "bold" }}>{token}</Text>
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
