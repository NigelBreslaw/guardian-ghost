import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import Auth from "./src/AuthUI.tsx";

export default function App() {
  const [token, setToken] = useState("");
  const [membershipID, setMembershipID] = useState("");

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
      <Auth setToken={setToken} setMembershipID={setMembershipID} />
      <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>
        Auth token: <Text style={{ fontWeight: "bold" }}>{token}</Text>
      </Text>
      {membershipID && (
        <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>
          Membership ID: <Text style={{ fontWeight: "bold" }}>{membershipID}</Text>
        </Text>
      )}
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
