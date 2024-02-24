import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NavigationProp } from "@react-navigation/native";
import AuthService from "../authentication/AuthService";
import AuthUI from "../authentication/AuthUI";
import { useGlobalStateContext } from "../state/GlobalState";
import { useEffect } from "react";

export default function Login({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const colorScheme = useColorScheme();
  const globalState = useGlobalStateContext();

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;

  useEffect(() => {
    if (globalState.appReady && globalState.authenticated) {
      console.log("authenticated so dismiss login view");
      navigation.goBack();
    }
  }, [globalState.appReady, globalState.authenticated, navigation]);

  return (
    <SafeAreaView style={themeContainerStyle}>
      <View style={styles.container}>
        <View style={{ marginTop: 100 }} />
        <Text style={{ ...themeTextStyle, fontSize: 50, fontWeight: "bold", letterSpacing: -2, lineHeight: 48 }}>
          Welcome to Guardian Ghost
        </Text>
        <View style={{ marginTop: 40 }} />
        <Text style={themeTextStyle}>To take your Destiny 2 experience to the next level, please login.</Text>
        <View style={{ marginTop: 20 }} />
        <AuthUI />
        <View style={styles.spacer} />
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
