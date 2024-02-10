import { Platform } from "react-native";

// @ts-ignore
export const apiKey = process.env.EXPO_PUBLIC_API_KEY;
// @ts-ignore
export const clientID = "46261"; //process.env.EXPO_PUBLIC_CLIENT_ID;
// @ts-ignore
export const clientSecret = "qVT6lYzc-t00NiqSRJc8lwbqdXuDMAweEt5-QDF3SU0"; //process.env.EXPO_PUBLIC_CLIENT_SECRET;

const isLocalWeb = process.env.NODE_ENV === "development" && Platform.OS === "web";

const localWebRedirectURL = "https://localhost:19006/auth";
const normalRedirectURL = "https://guardianghost.com/auth";
export const redirectURL = isLocalWeb ? localWebRedirectURL : normalRedirectURL;
