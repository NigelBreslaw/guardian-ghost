import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";

type AuthUIProps = {
  startAuth: () => void;
  processURL: (url: string) => void;
};

export default function AuthUI(props: AuthUIProps) {
  const url = useURL();
  addEventListener("url", (event) => {
    handleRedirect(event);
  });

  useEffect(() => {
    if (url) {
      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]);

  function handleRedirect(event: { url: string }) {
    if (Platform.OS === "ios") {
      props.processURL(event.url);
    }
  }

  return <Button title="Auth" onPress={props.startAuth} />;
}
