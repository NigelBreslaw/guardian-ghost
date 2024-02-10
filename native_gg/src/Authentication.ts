import { apiKey, clientID, clientSecret } from "./constants/env.ts";

type InitialAuthJWT = {
  access_token: string;
  expires_in: number;
  membership_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
};

export function handleAuthCode(code: string) {
  getAuthToken(code)
    .then((initialJWT) => {
      processInitialAuthJWT(initialJWT);
    })
    .catch(console.error);
}

export function getAuthToken(bungieCode: string): Promise<JSON> {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const bodyParams = `client_id=${clientID}&grant_type=authorization_code&code=${bungieCode}&client_secret=${clientSecret}`;

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: bodyParams,
  };

  return new Promise((resolve, reject) => {
    fetch("https://www.bungie.net/platform/app/oauth/token/", requestOptions)
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function processInitialAuthJWT(jwtToken: unknown): string {
  const initialAuthJWT = jwtToken as InitialAuthJWT;

  if (Object.hasOwn(initialAuthJWT, "membership_id")) {
    return initialAuthJWT.membership_id;
  }

  console.error("membership_id property does not exist");
  return "";
}
