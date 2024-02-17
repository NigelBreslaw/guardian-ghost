import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";

type AuthUIProps = {
  disabled: boolean;
  startAuth: () => void;
  processURL: (url: string) => void;
};

export default function AuthUI(props: AuthUIProps) {
  const url = useURL();

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

  return <Button disabled={props.disabled} title="Auth" onPress={props.startAuth} />;
}
