import { Image } from "expo-image";
import { Button, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthService from "../authentication/AuthService";
import AuthUI from "../authentication/AuthUI";
import { useGlobalStateContext } from "../state/GlobalState";

type theme = "light" | "dark" | "auto";

export default function Director() {
  const colorScheme = useColorScheme();

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;
  const globalState = useGlobalStateContext();

  const accountAvatar = globalState.appReady
    ? globalState.currentAccount
      ? `https://www.bungie.net${globalState.currentAccount.iconPath}`
      : "https://d33wubrfki0l68.cloudfront.net/554c3b0e09cf167f0281fda839a5433f2040b349/ecfc9/img/header_logo.svg"
    : "";

  return (
    <SafeAreaView style={themeContainerStyle}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={themeTextStyle}>Guardian Ghost</Text>
          <View style={styles.spacer} />
          <View style={styles.imageContainer}>
            <Image style={styles.image} contentFit="contain" transition={300} source={accountAvatar} />
          </View>
          <View style={styles.spacer} />
          <AuthUI
            disabled={globalState.authenticated}
            startAuth={() => {
              AuthService.startAuth();
            }}
            processURL={(url) => {
              AuthService.processURL(url);
            }}
          />

          <Text style={{ marginTop: 15, ...themeTextStyle }}>Membership ID:</Text>
          <Text style={{ fontWeight: "bold", ...themeTextStyle }}>
            {globalState.currentAccount?.supplementalDisplayName}
          </Text>

          <Text style={{ marginTop: 15, ...themeTextStyle }}>
            Authenticated:{" "}
            <Text style={{ fontWeight: "bold", ...themeTextStyle }}>
              {globalState.authenticated ? "True" : "False"}
            </Text>
          </Text>
          <View style={styles.spacer} />
          <Button
            title="Logout"
            disabled={!globalState.authenticated}
            onPress={() => AuthService.logoutCurrentUser()}
          />
          <View style={styles.spacer} />
        </View>
      </ScrollView>
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
