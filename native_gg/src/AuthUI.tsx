import { useURL, parse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";
import { randomUUID } from "expo-crypto";
import { clientID, redirectURL } from "./constants/env.ts";
import { getAuthToken, handleAuthCode } from "./Authentication.ts";

type AuthProps = {
  setToken: (token: string) => void;
  setMembershipID: (membership_id: string) => void;
};

const stateID = randomUUID();
const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${stateID}`;

export default function AuthUI(props: AuthProps) {
  const url = useURL();

  useEffect(() => {
    if (url) {
      if (Platform.OS === "ios") {
        processURL(url);
      }

      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]);

  function processURL(url: string) {
    const { queryParams } = parse(url);
    if (queryParams?.code && queryParams?.state === stateID) {
      const code = queryParams.code.toString();
      props.setToken(code);

      handleAuthCode(code);
    } else {
      console.error("Invalid URL");
      return;
    }

    if (Platform.OS === "ios") {
      WebBrowser.dismissAuthSession();
    }
  }

  function startAuth() {
    console.log("startAuth", authURL);
    WebBrowser.openAuthSessionAsync(authURL, redirectURL).then((result) => {
      // Only used for web.
      if (result?.type === "success") {
        console.log("start auth process URL");
        processURL(result.url);
      }
    });
  }

  return <Button title="Auth" onPress={startAuth} />;
}
