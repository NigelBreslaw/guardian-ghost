import { Platform } from "react-native";

// @ts-ignore
export const apiKey = process.env.EXPO_PUBLIC_API_KEY;
// @ts-ignore
export const clientIDD = process.env.EXPO_PUBLIC_CLIENT_ID;
// @ts-ignore
export const clientSecret = process.env.EXPO_PUBLIC_CLIENT_SECRET;

const isLocalWeb = process.env.NODE_ENV === "development" && Platform.OS === "web";
const localWebAppID = "46261";
const normalAppID = "46250";
const localWebRedirectURL = "https://localhost:19006/auth";
const normalRedirectURL = "https://guardianghost.com/auth";
export const redirectURL = isLocalWeb ? localWebRedirectURL : normalRedirectURL;
export const appID = isLocalWeb ? localWebAppID : normalAppID;
