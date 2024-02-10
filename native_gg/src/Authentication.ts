import { apiKey, clientID, clientSecret } from "./constants/env.ts";

export function getAuthToken(bungieCode: string): Promise<JSON> {
  // {
  const headers = new Headers();
  //   headers.append("X-API-Key", apiKey);
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const bodyParams = `client_id=${clientID}&grant_type=authorization_code&code=${bungieCode}&client_secret=${clientSecret}`;
  //   const bodyParams = new URLSearchParams({
  //     client_id: clientID,
  //     grant_type: "authorization_code",
  //     code: bungieCode,
  //     client_secret: clientSecret,
  //   });

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
        // console.log("response", response);
        return response.json();
      })
      .then((data) => {
        resolve(data); // Resolve the promise with the fetched data
      })
      .catch((error) => {
        reject(error); // Reject the promise with the error
      });
  });
}
