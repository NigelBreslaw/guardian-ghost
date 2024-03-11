import { Platform } from "react-native";

if (process.env.EXPO_PUBLIC_API_KEY === undefined) {
  console.warn("Missing env file!");
}

const isLocalWeb = process.env.NODE_ENV === "development" && Platform.OS === "web";
// @ts-ignore
export const apiKey: string = !isLocalWeb ? process.env.EXPO_PUBLIC_API_KEY : process.env.EXPO_PUBLIC_API_KEY_WEB;
// @ts-ignore
export const clientID: string = !isLocalWeb ? process.env.EXPO_PUBLIC_CLIENT_ID : process.env.EXPO_PUBLIC_CLIENT_ID_WEB;
// @ts-ignore
export const clientSecret: string = !isLocalWeb
  ? process.env.EXPO_PUBLIC_CLIENT_SECRET
  : process.env.EXPO_PUBLIC_CLIENT_SECRET_WEB;

export const redirectURL = "https://app.guardianghost.com/auth";
