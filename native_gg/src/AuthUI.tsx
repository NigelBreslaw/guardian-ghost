import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";

type AuthProps = {
  startAuth: () => void;
  processURL: (url: string) => void;
};

export default function AuthUI(props: AuthProps) {
  const url = useURL();
  addEventListener("url", (event) => {
    handleRedirect(event);
  });

  function handleRedirect(event: { url: string }) {
    if (Platform.OS === "ios") {
      console.log("handleRedirect!");
      props.processURL(event.url);
    }
  }

  useEffect(() => {
    if (url) {
      console.log("useEffect!");

      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]); // Add props.startAuth to the dependency array

  return <Button title="Auth" onPress={props.startAuth} />;
}
