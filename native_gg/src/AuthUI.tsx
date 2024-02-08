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

export default function Auth(props: AuthProps) {
  const url = useURL();

  useEffect(() => {
    if (url) {
      const { queryParams } = parse(url);

      // Check if the stateID matches to avoid man in the middle attacks.
      if (queryParams?.code && queryParams?.state === stateID) {
        props.setToken(queryParams.code.toString());

        if (Platform.OS === "ios") {
          WebBrowser.dismissAuthSession();
        }

        if (Platform.OS === "web") {
          WebBrowser.maybeCompleteAuthSession();
        }
      }
    }
  }, [url, props.setToken]);

  function processURL(url: string) {
    if (Platform.OS === "web") {
      const { queryParams } = parse(url);
      if (queryParams?.code) {
        props.setToken(queryParams.code.toString());
      }
    }
  }

  function openURL(url: string) {
    WebBrowser.openAuthSessionAsync(url, `${redirectURL}`).then((result) => {
      if (result?.type === "success") {
        processURL(result.url);
      }
    });
  }

  return (
    <Button
      title="Auth"
      onPress={() =>
        openURL(
          `https://www.bungie.net/en/oauth/authorize?client_id=${appID}&response_type=code&reauth=true&state=${stateID}`,
        )
      }
    />
  );
}
