import { apiKey, clientID, clientSecret } from "./constants/env.ts";
import * as v from "valibot";
import base64 from "base-64";

const authJWTSchema = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  membership_id: v.optional(v.string()),
  refresh_expires_in: v.number(),
  refresh_token: v.string(),
  time_stamp: v.optional(v.string([v.isoDateTime()])),
  token_type: v.string(),
});

type InitialAuthJWT = v.Output<typeof authJWTSchema>;

const refreshTokenSchema = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  refresh_expires_in: v.number(),
  refresh_token: v.string(),
  time_stamp: v.string([v.isoTimestamp()]),
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

  console.log("authorization", headers.get("Authorization"));

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

// private static function accessTokenFromRefreshTokenPostRequest ( Network.OauthToken token ) -> Http.Request {

//   Http.Request authRequest

//   var isDesktop = @device(Desktop) || App.isPreview
//   // System.log("IS DESKTOP!!", isDesktop)
//   /// Note API key does not seem to be needed here
//   var apiKey = isDesktop ? Network.Authentication.Secret.desktopApiKey : Network.Authentication.Secret.mobileApiKey
//   var clientId = isDesktop ? Network.Authentication.Secret.destktopClientId : Network.Authentication.Secret.mobileClientId
//   var clientSecret = isDesktop ? Network.Authentication.Secret.destktopClientSecret : Network.Authentication.Secret.mobileClientSecret

//   authRequest.setHeader("X-API-Key", apiKey)
//   authRequest.setHeader( "Authorization", "Basic " + String.base64Encoded( clientId+ ":"+ clientSecret ) )

//   String param = "grant_type=refresh_token&refresh_token={0}".arg( token.refresh_token )

//   authRequest.setContent("application/x-www-form-urlencoded", param )

//   var url = "https://www.bungie.net/platform/app/oauth/token/"

//   authRequest.url = url

//   return authRequest
// }

function processInitialAuthJWT(jwtToken: object): string {
  // check it is valid
  // add a timestamp
  try {
    const initialToken: InitialAuthJWT = v.parse(authJWTSchema, jwtToken);

    let membership_id = "";
    if (Object.hasOwn(initialToken, "membership_id") && typeof initialToken.membership_id === "string") {
      membership_id = initialToken.membership_id;
    }
    const key = "membership_id";
    delete initialToken[key];

    initialToken.time_stamp = new Date().toISOString();

    const token = v.parse(refreshTokenSchema, initialToken);

    getAccessToken(token)
      .then((newToken) => {
        console.log("newtoken", newToken);
      })
      .catch((error) => {
        console.error(error);
      });

    return membership_id;
  } catch (error) {
    console.error(error);
    return "";
  }
}
