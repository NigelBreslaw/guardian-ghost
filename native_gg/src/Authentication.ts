import { clientID, clientSecret } from "./constants/env.ts";
import * as v from "valibot";

const authJWTSchema = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  membership_id: v.string(),
  refresh_expires_in: v.number(),
  refresh_token: v.string(),
  token_type: v.string(),
});

type InitialAuthJWT = v.Output<typeof authJWTSchema>;

export function handleAuthCode(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    getAuthToken(code)
      .then((initialJWT) => {
        const membership_id = processInitialAuthJWT(initialJWT);

        resolve(membership_id);
      })
      .catch((error) => {
        reject(error);
      });
  });
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
  try {
    const result = v.parse(authJWTSchema, jwtToken);
    return result.membership_id;
  } catch (error) {
    console.error(error);
    return "";
  }
}
