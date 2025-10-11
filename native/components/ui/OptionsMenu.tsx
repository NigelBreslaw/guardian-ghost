import { Platform } from "react-native";

// Platform-specific implementations
const OptionsMenuIOS = require("./OptionsMenu.ios").default;
const OptionsMenuAndroid = require("./OptionsMenu.android").default;
const OptionsMenuWeb = require("./OptionsMenu.web").default;

const OptionsMenu = Platform.select({
  ios: OptionsMenuIOS,
  android: OptionsMenuAndroid,
  web: OptionsMenuWeb,
  default: OptionsMenuWeb,
});

export default OptionsMenu;
