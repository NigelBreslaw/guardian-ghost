import { StatusBar } from "expo-status-bar";
import { Button, ScrollView, StyleSheet, Text, View, useColorScheme, Appearance, ColorSchemeName } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useEffect, useReducer, useRef } from "react";
import AuthUI from "../authentication/AuthUI.tsx";
import AuthService from "../authentication/AuthService.ts";
import { authReducer, initialAuthState } from "../state/Actions.ts";
import StorageGG from "../storage/StorageGG.ts";
import type { SizeTokens } from "tamagui";
import { Label, RadioGroup, Theme, XStack, YStack } from "tamagui";

type theme = "light" | "dark" | "auto";

export default function Director() {
  const storeRef = useRef(StorageGG.getInstance());
  const authServiceRef = useRef<AuthService | null>(null);
  const colorScheme = useColorScheme();

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;
  const themeTamagui = colorScheme === "light" ? "light" : "dark";

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
    <SafeAreaView style={themeContainerStyle}>
      <StatusBar />
      <ScrollView>
        <View style={styles.container}>
          <Text style={themeTextStyle}>Guardian Ghost</Text>
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

          <Text style={{ marginTop: 15, ...themeTextStyle }}>Membership ID:</Text>
          <Text style={{ fontWeight: "bold", ...themeTextStyle }}>{state.currentAccount?.supplementalDisplayName}</Text>

          <Text style={{ marginTop: 15, ...themeTextStyle }}>
            Authenticated:{" "}
            <Text style={{ fontWeight: "bold", ...themeTextStyle }}>{state.authenticated ? "True" : "False"}</Text>
          </Text>
          <View style={styles.spacer} />
          <Button title="Logout" disabled={!state.authenticated} onPress={() => AuthService.logoutCurrentUser()} />
          <View style={styles.spacer} />
          <Theme name={themeTamagui}>
            <RadioGroup
              aria-labelledby="Select one item"
              defaultValue="auto"
              name="form"
              onValueChange={(value) => {
                const appearanceValue = value === "auto" ? undefined : (value as ColorSchemeName);
                Appearance.setColorScheme(appearanceValue);
              }}
            >
              <YStack width={300} alignItems="center" space="$1">
                <RadioGroupItemWithLabel size="$5" value={"auto"} label="Automatic" />
                <RadioGroupItemWithLabel size="$5" value="light" label="Light" />
                <RadioGroupItemWithLabel size="$5" value="dark" label="Dark" />
              </YStack>
            </RadioGroup>
          </Theme>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RadioGroupItemWithLabel(props: {
  size: SizeTokens;
  value: string;
  label: string;
}) {
  const id = `radiogroup-${props.value}`;
  return (
    <XStack width={300} alignItems="center" space="$4">
      <RadioGroup.Item value={props.value} id={id} size={props.size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>

      <Label size={props.size} htmlFor={id}>
        {props.label}
      </Label>
    </XStack>
  );
}

const styles = StyleSheet.create({
  topContainerLight: {
    flex: 1,
    backgroundColor: "#8A9BDF",
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
