import { StatusBar } from "expo-status-bar";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useEffect, useReducer, useRef } from "react";
import AuthUI from "../authentication/AuthUI.tsx";
import AuthService from "../authentication/AuthService.ts";
import { authReducer, initialAuthState } from "../state/Actions.ts";
import { getItemDefinition, getProfileTest, saveItemDefinition } from "../backend/api.ts";
import StorageGG from "../storage/StorageGG.ts";

export default function Director() {
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SafeAreaView style={styles.topContainer}>
        <StatusBar style="light" />
        <ScrollView>
          <View style={styles.container}>
            <Text style={{ fontSize: 20, color: "#fff" }}>Guardian Ghost</Text>
            <View style={styles.spacer} />
            <View style={styles.imageContainer}>
              <Image style={styles.image} contentFit="contain" transition={300} source={accountAvatar} />
            </View>
            <View style={styles.spacer} />
            <AuthUI
              disabled={state.authenticated}
              startAuth={() => {
                AuthService.startAuth();
              }}
              processURL={(url) => {
                AuthService.processURL(url);
              }}
            />

            <Text style={{ fontSize: 22, marginTop: 15, color: "#F1EDFE" }}>Membership ID:</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#F1EDFE" }}>
              {state.currentAccount?.supplementalDisplayName}
            </Text>

            <Text style={{ fontSize: 22, marginTop: 15, color: "#F1EDFE" }}>
              Authenticated:{" "}
              <Text style={{ fontWeight: "bold", color: "#F1EDFE" }}>{state.authenticated ? "True" : "False"}</Text>
            </Text>
            <View style={styles.spacer} />
            <Button title="Logout" disabled={!state.authenticated} onPress={() => AuthService.logoutCurrentUser()} />
            <View style={styles.spacer} />
            <Button title="Download Item Definition" onPress={() => saveItemDefinition()} />
            <View style={styles.spacer} />
            <Button title="Get saved Item Definition" onPress={() => getItemDefinition()} />
            <View style={styles.spacer} />
            <Button disabled={!state.authenticated} title="getProfile()" onPress={() => getProfileTest()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: "#171321",
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  scrollContainer: {},
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
