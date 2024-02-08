import { useURL, parse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";
import { randomUUID } from "expo-crypto";
import { appID, redirectURL } from "./constants/env.ts";

type AuthProps = {
  token: string;
  setToken: (token: string) => void;
};

const stateID = randomUUID();
const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${appID}&response_type=code&reauth=true&state=${stateID}`;

export default function Auth(props: AuthProps) {
  const url = useURL();

  useEffect(() => {
    if (url) {
      processURL(url);
      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]);

  function processURL(url: string) {
    const { queryParams } = parse(url);
    if (queryParams?.code && queryParams?.state === stateID) {
      props.setToken(queryParams.code.toString());
    } else {
      console.error("Invalid URL");
      return;
    }

    if (Platform.OS === "ios") {
      WebBrowser.dismissAuthSession();
    }
  }

  function startAuth() {
    WebBrowser.openAuthSessionAsync(authURL, redirectURL).then((result) => {
      // Only used for web.
      if (result?.type === "success") {
        processURL(result.url);
      }
    });
  }

  return <Button title="Auth" onPress={startAuth} />;
}
