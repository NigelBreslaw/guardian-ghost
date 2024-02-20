import { Platform } from "react-native";

// @ts-ignore
export const apiKey: string = process.env.EXPO_PUBLIC_API_KEY;
// @ts-ignore
export const clientID: string = process.env.EXPO_PUBLIC_CLIENT_ID;
// @ts-ignore
export const clientSecret: string = process.env.EXPO_PUBLIC_CLIENT_SECRET;

const isLocalWeb = process.env.NODE_ENV === "development" && Platform.OS === "web";

const localWebRedirectURL = "https://localhost:19006/auth";
const normalRedirectURL = "https://app.guardianghost.com/auth";
export const redirectURL = isLocalWeb ? localWebRedirectURL : normalRedirectURL;
