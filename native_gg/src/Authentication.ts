import { apiKey, clientID, clientSecret } from "./constants/env.ts";
import * as v from "valibot";
import * as base64 from "base-64";

const refreshTokenSchema = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  membership_id: v.string(),
  refresh_expires_in: v.number(),
  refresh_token: v.string(),
  time_stamp: v.optional(v.string([v.isoTimestamp()])),
  token_type: v.string(),
});

type RefreshToken = v.Output<typeof refreshTokenSchema>;

export function handleAuthCode(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    getRefreshToken(code)
      .then((initialJWT) => {
        const membership_id = processInitialAuthJWT(initialJWT);

        resolve(membership_id);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function getRefreshToken(bungieCode: string): Promise<JSON> {
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

export function getAccessToken(token: RefreshToken): Promise<RefreshToken> {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");
  headers.append("X-API-Key", apiKey);
  // TODO: base64 package can be removed soon as Hermes is adding support for these in 0.74
  // https://github.com/facebook/hermes/issues/1178
  headers.append("Authorization", `Basic ${base64.encode(`${clientID}:${clientSecret}`)}`);

  const bodyParams = `grant_type=refresh_token&refresh_token=${token.refresh_token}`;

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

function processInitialAuthJWT(jwtToken: object): string {
  try {
    const initialToken = v.parse(refreshTokenSchema, jwtToken);

    let token: RefreshToken;

    getAccessToken(initialToken)
      .then((newToken) => {
        token = v.parse(refreshTokenSchema, newToken);
        token.time_stamp = new Date().toISOString();
        const tokenTime = new Date(token.time_stamp).getTime();
        // pause for 10 seconds, but don't do anything else
        setTimeout(() => {
          const timeNow = new Date().getTime();
          console.log("token time", Math.trunc((timeNow - tokenTime) / 1000));
        }, 10000);
      })
      .catch((error) => {
        console.error(error);
      });

    return initialToken.membership_id;
  } catch (error) {
    console.error(error);
    return "";
  }
}
