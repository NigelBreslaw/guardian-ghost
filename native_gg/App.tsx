import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useReducer, useRef } from "react";
import AuthUI from "./src/authentication/AuthUI.tsx";
import { clientID } from "./src/constants/env.ts";
import AuthService from "./src/authentication/AuthService.ts";
import { authReducer, initialAuthState } from "./src/state/Actions.ts";

export default function App() {
  if (process.env.NODE_ENV === "development" && clientID === undefined) {
    console.warn("No .ENV file found. Please create one.");
  }
  const authServiceRef = useRef<AuthService | null>(null);

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const accountAvatar = state.initComplete
    ? state.currentAccount
      ? `https://www.bungie.net${state.currentAccount?.iconPath}`
      : "https://d33wubrfki0l68.cloudfront.net/554c3b0e09cf167f0281fda839a5433f2040b349/ecfc9/img/header_logo.svg"
    : "";

  useEffect(() => {
    authServiceRef.current = AuthService.getInstance();
    authServiceRef.current.subscribe(dispatch);
    // Unsubscribe when the component unmounts
    return () => {
      if (authServiceRef.current) {
        authServiceRef.current.cleanup();
      }
      authServiceRef.current = null;
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#232526", "#66686a"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <Text style={{ color: "#fff" }}>Guardian Ghost</Text>

      <Image style={{ width: 200, height: 200 }} contentFit="contain" transition={300} source={accountAvatar} />

      <AuthUI
        startAuth={() => {
          if (authServiceRef.current) {
            authServiceRef.current.startAuth();
          }
        }}
        processURL={(url) => {
          if (authServiceRef.current) {
            authServiceRef.current.processURL(url);
          }
        }}
      />

      <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>
        Membership ID: <Text style={{ fontWeight: "bold" }}>{state.currentAccount?.supplementalDisplayName}</Text>
      </Text>
      <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>
        Authenticated: <Text style={{ fontWeight: "bold" }}>{state.authenticated ? "True" : "False"}</Text>
      </Text>
      <Button title="Logout" onPress={() => AuthService.logoutCurrentUser()} />
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
