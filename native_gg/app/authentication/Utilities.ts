import * as base64 from "base-64";
import { isoTimestamp, number, object, optional, parse, string } from "valibot";
import type { Output } from "valibot";
import { apiKey, clientID, clientSecret } from "../../constants/env";

export const authTokenSchema = object({
  access_token: string(),
  expires_in: number(),
  membership_id: string(),
  refresh_expires_in: number(),
  refresh_token: string(),
  time_stamp: optional(string([isoTimestamp()])),
  token_type: string(),
});

export type AuthToken = Output<typeof authTokenSchema>;

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
        console.error("getRefreshToken", error);
        reject(error);
      });
  });
}

export function getAccessToken(token: AuthToken): Promise<AuthToken> {
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

        response.json().then((rawToken) => {
          try {
            const validatedToken = parse(authTokenSchema, rawToken);
            validatedToken.time_stamp = new Date().toISOString();
            resolve(validatedToken);
          } catch (error) {
            console.error("went wrong here");
            return reject(error);
          }
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function isValidAccessToken(token: AuthToken): boolean {
  // Access lasts 3600 seconds (1 hour)
  if (token.time_stamp) {
    const lifeTime = token.expires_in;
    const timeNow = new Date();
    const timeThen = new Date(token.time_stamp);
    const secondsLeft = lifeTime - (timeNow.getTime() - timeThen.getTime()) / 1000;
    // Count anything less than 5 mins (345 seconds) as expired
    return secondsLeft > 345;
  }

  return true;
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
