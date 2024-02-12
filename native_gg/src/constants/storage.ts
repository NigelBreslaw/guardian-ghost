// I want to export a name space 'storage' that has several constants such as 'current_ID' and 'auth_token' that are used in the native_gg/src/authentication/AuthService.ts file. I will use the 'export' keyword to export the name space 'storage' and then use the 'export' keyword to export the constants 'current_ID' and 'auth_token' from the name space 'storage'.
export const Store = {
  current_user_ID: "current_user_ID",
  _refresh_token: "_refresh_token",
};
