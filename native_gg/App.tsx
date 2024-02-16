import { StatusBar } from "expo-status-bar";
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useReducer, useRef } from "react";
import AuthUI from "./src/authentication/AuthUI.tsx";
import { clientID } from "./src/constants/env.ts";
import AuthService from "./src/authentication/AuthService.ts";
import { authReducer, initialAuthState } from "./src/state/Actions.ts";
import { getItemDefinition, getProfileTest, saveItemDefinition } from "./src/backend/api.ts";
import StorageGG from "./src/storage/StorageGG.ts";

export default function App() {
  if (process.env.NODE_ENV === "development" && clientID === undefined) {
    console.warn("No .ENV file found. Please create one.");
  }
  const storeRef = useRef(StorageGG.getInstance());
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
    <SafeAreaView style={styles.topContainer}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#232526", "#66686a"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <ScrollView alwaysBounceVertical={false} contentContainerStyle={styles.container}>
        <Text style={{ fontSize: 20, color: "#fff" }}>Guardian Ghost</Text>
        <View style={styles.spacer} />
        <View style={styles.imageContainer}>
          <Image style={styles.image} contentFit="contain" transition={300} source={accountAvatar} />
        </View>
        <View style={styles.spacer} />
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

        <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>Membership ID:</Text>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>{state.currentAccount?.supplementalDisplayName}</Text>

        <Text style={{ fontSize: 22, marginTop: 15, color: "#150f63" }}>
          Authenticated: <Text style={{ fontWeight: "bold" }}>{state.authenticated ? "True" : "False"}</Text>
        </Text>
        <View style={styles.spacer} />
        <Button title="Logout" onPress={() => AuthService.logoutCurrentUser()} />
        <View style={styles.spacer} />
        <Button title="Download Item Definition" onPress={() => saveItemDefinition()} />
        <View style={styles.spacer} />
        <Button title="Get saved Item Definition" onPress={() => getItemDefinition()} />
        <View style={styles.spacer} />
        <Button title="getProfile()" onPress={() => getProfileTest()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
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
