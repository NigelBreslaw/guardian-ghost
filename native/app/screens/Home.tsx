import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useGlobalStateContext } from "@/state/GlobalState.tsx";

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const colorScheme = useColorScheme();

  const themeColor = colorScheme === "light" ? "#F2F5FC" : "#171321";
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;
  const buttonColor = colorScheme === "light" ? "#3375de" : "#B4B4EA";

  return (
    <View style={{ ...styles.topContainer, backgroundColor: themeColor }}>
      <View style={{ marginTop: 100 }} />
      <Text style={{ ...themeTextStyle, fontSize: 50, fontWeight: "bold", letterSpacing: -2, lineHeight: 48 }}>
        Home Screen
      </Text>

      {globalState.loggingIn && (
        <View>
          <Text style={{ ...themeTextStyle, fontSize: 30 }}>
            {`Account Status: ${globalState.currentAccount !== null ? "Yes" : "Waiting..."}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  textLight: {
    color: "black",
    fontSize: 22,
  },
  textDark: {
    color: "#F1EDFE",
    fontSize: 22,
  },
});
