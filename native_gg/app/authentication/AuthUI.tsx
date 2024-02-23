import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform, useColorScheme } from "react-native";
import { Button, ButtonSpinner, ButtonText } from "@gluestack-ui/themed";

type AuthUIProps = {
  disabled: boolean;
  startAuth: () => void;
  processURL: (url: string) => void;
};

export default function AuthUI(props: AuthUIProps) {
  const url = useURL();
  const colorScheme = useColorScheme();

  const buttonColor = colorScheme === "light" ? "#3375de" : "#B4B4EA";

  const [loginInProgress, setLoginInProgress] = useState(false);

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
        props.processURL(event.url);
      }
    };

    const listener = addEventListener("url", handleRedirect);

    return () => {
      listener.remove();
    };
  }, [props.processURL]);

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
      isDisabled={loginInProgress}
      isFocusVisible={false}
      onPress={() => {
        setLoginInProgress(true);
        props.startAuth();
      }}
      style={{ alignSelf: "stretch", borderColor: buttonColor }}
    >
      {loginInProgress && <ButtonSpinner mr="$1" />}
      <ButtonText color={buttonColor}>Login</ButtonText>
    </Button>
  );
}
