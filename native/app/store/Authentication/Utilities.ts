import { isoTimestamp, number, object, parse, string, type InferOutput, pipe } from "valibot";

import { apiKey, clientID, clientSecret } from "@/constants/env.ts";

export const authTokenSchema = object({
  access_token: string(),
  expires_in: number(),
  membership_id: string(),
  refresh_expires_in: number(),
  refresh_token: string(),
  time_stamp: pipe(string(), isoTimestamp()),
  token_type: string(),
});

export type AuthToken = InferOutput<typeof authTokenSchema>;

export function getRefreshToken(bungieCode: string): Promise<AuthToken> {
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
      .then((rawToken) => {
        try {
          // Add the time_stamp or the validation will fail.
          rawToken.time_stamp = new Date().toISOString();
          const validatedToken = parse(authTokenSchema, rawToken);

          return resolve(validatedToken);
        } catch (error) {
          console.error("went wrong here");
          return reject(new Error(`getRefreshToken Error ${error}`));
        }
      })
      .catch((error) => {
        console.error("getRefreshToken", error);
        reject(new Error(`getRefreshToken Error ${error}`));
      });
  });
}

// This returns JSON instead of an auth token so the system being disabled can be handled.
// This also returns JSON with an error message inside it. This is handled later on.
export function getAccessToken(token: AuthToken): Promise<JSON> {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");
  headers.append("X-API-Key", apiKey);
  const authHeader = btoa(`${clientID}:${clientSecret}`);
  headers.append("Authorization", `Basic ${authHeader}`);

  const bodyParams = `grant_type=refresh_token&refresh_token=${token.refresh_token}`;

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: bodyParams,
  };

  return new Promise((resolve, reject) => {
    fetch("https://www.bungie.net/platform/app/oauth/token/", requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        responseJson.time_stamp = new Date().toISOString();
        return resolve(responseJson);
      })
      .catch((error) => {
        reject(new Error(`getAccessToken Error ${error}`));
      });
  });
}

export function isValidAccessToken(token: AuthToken): boolean {
  // Access lasts 3600 seconds (1 hour)
  const lifeTime = token.expires_in;
  const timeNow = new Date();
  const timeThen = new Date(token.time_stamp);
  const secondsLeft = lifeTime - (timeNow.getTime() - timeThen.getTime()) / 1000;
  // Count anything less than 5 mins (345 seconds) as expired
  return secondsLeft > 345;
}

export function isValidRefreshToken(token: AuthToken): boolean {
  // Refresh lasts 7,776,000 seconds (90 days)
  if (token.time_stamp) {
    const lifeTime = token.refresh_expires_in;
    const timeNow = new Date();
    const timeThen = new Date(token.time_stamp);
    const secondsLeft = lifeTime - (timeNow.getTime() - timeThen.getTime()) / 1000;
    // Count anything less than 5 mins (345 seconds) as expired
    return secondsLeft > 345;
  }

  return true;
}
