import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import { Button, ButtonSpinner, ButtonText } from "@gluestack-ui/themed";
import AuthService from "./AuthService";
import { useGlobalStateContext } from "../state/GlobalState";

export default function AuthUI() {
  const globalState = useGlobalStateContext();
  const url = useURL();
  const colorScheme = useColorScheme();
  const buttonColor = colorScheme === "light" ? "#3375de" : "#B4B4EA";

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
        AuthService.processURL(event.url);
      }
    };

    const listener = addEventListener("url", handleRedirect);

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (url) {
      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]);

  return (
    <Button
      size="xl"
      variant="outline"
      action="primary"
      isDisabled={globalState.loggingIn}
      isFocusVisible={false}
      onPress={() => {
        AuthService.startAuth();
      }}
      style={{ alignSelf: "stretch", borderColor: buttonColor }}
    >
      {globalState.loggingIn && <ButtonSpinner mr="$1" />}
      <ButtonText color={buttonColor}>Login</ButtonText>
    </Button>
  );
}
