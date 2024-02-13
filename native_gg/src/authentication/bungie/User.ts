import { apiKey } from "../../constants/env.ts";
import AuthService from "../AuthService.ts";

// static async function getLinkedProfilesGetRequest( String bungieMembershipId, Bool getAll ) -> Http.Request {

//     var isDesktop = @device(Desktop) || App.isPreview
//     var apiKey = isDesktop ? Network.Authentication.Secret.desktopApiKey : Network.Authentication.Secret.mobileApiKey

//     ///  Create the request and populate the headers correctly
//     Http.Request req

//     var authAndToken = await Network.Authentication.getAuthToken( "getLinkedProfilesGetRequest" )
//     req.setHeader( "Authorization", authAndToken.authRequest.header( "Authorization" ) )
//     req.setHeader( "X-API-Key", apiKey )

//     Dictionary< String, String > parameters = [
//         "getAllMemberships": "true",
//     ]

//     if getAll {
//         for var key in parameters.keys() {
//             req.setParameter( key, parameters[ key ] )
//         }
//     }

//     req.url ="https://www.bungie.net/Platform/Destiny2/254/Profile/{0}/LinkedProfiles/".arg( bungieMembershipId )

//     return req
// }

export async function getLinkedProfiles(membership_id: string): Promise<JSON> {
  const authToken = await AuthService.getTokenAsync();
  if (authToken === null) {
    return Promise.reject("No auth token");
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken.access_token}`);
  headers.append("X-API-Key", apiKey);

  const parameters = new URLSearchParams({
    getAllMemberships: "true",
  });

  console.log("parameters", parameters);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    fetch(`https://www.bungie.net/Platform/Destiny2/254/Profile/${membership_id}/LinkedProfiles/`, requestOptions)
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
