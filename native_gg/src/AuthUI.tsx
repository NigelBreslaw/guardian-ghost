import { useURL, parse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Button, Platform } from "react-native";
import { randomUUID } from "expo-crypto";
import { appID, redirectURL } from "./constants/env.ts";
import { getAuthToken } from "./Authentication.ts";

type InitialAuthJWT = {
  access_token: string;
  expires_in: number;
  membership_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
};

type AuthProps = {
  setToken: (token: string) => void;
  setMembershipID: (membership_id: string) => void;
};

const stateID = randomUUID();
const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${appID}&response_type=code&reauth=true&state=${stateID}`;

export default function Auth(props: AuthProps) {
  const url = useURL();

  useEffect(() => {
    if (url) {
      console.log("useEffect process url");
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

      getAuthToken(code)
        .then((initialJWT) => {
          processInitialAuthJWT(initialJWT);
        })
        .catch(console.error);
    } else {
      console.error("Invalid URL");
      return;
    }

    if (Platform.OS === "ios") {
      WebBrowser.dismissAuthSession();
    }
  }

  function processInitialAuthJWT(jwtToken: unknown) {
    const initialAuthJWT = jwtToken as InitialAuthJWT;

    if (Object.hasOwn(initialAuthJWT, "membership_id")) {
      console.log("membership_id property exists");
      props.setMembershipID(initialAuthJWT.membership_id);
    } else {
      console.log("membership_id property does not exist");
    }
  }

  function startAuth() {
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
