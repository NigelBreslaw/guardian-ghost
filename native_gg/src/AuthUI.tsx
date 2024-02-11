import { useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";

type AuthProps = {
  startAuth: () => void;
  processURL: (url: string) => void;
};

export default function AuthUI(props: AuthProps) {
  const url = useURL();

  useEffect(() => {
    if (url) {
      if (Platform.OS === "ios") {
        props.processURL(url);
      }

      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url, props.processURL]);

  return <Button title="Auth" onPress={props.startAuth} />;
}
