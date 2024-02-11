import { randomUUID } from "expo-crypto";
import { parse, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";
import { handleAuthCode } from "./Authentication.ts";
import { clientID, redirectURL } from "./constants/env.ts";

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

  async function processURL(url: string) {
    const { queryParams } = parse(url);
    if (queryParams?.code && queryParams?.state === stateID) {
      const code = queryParams.code.toString();
      props.setToken(code);

      const membership_id = await handleAuthCode(code);
      props.setMembershipID(membership_id);
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
      if (result.type === "success") {
        processURL(result.url);
      }
    });
  }

  return <Button title="Auth" onPress={startAuth} />;
}
