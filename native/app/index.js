import "react-native-gesture-handler"; // Avoid crash in production https://reactnavigation.org/docs/stack-navigator/#installation
import * as Sentry from "@sentry/react-native";
import { registerRootComponent } from "expo";
import { Text, TextInput } from "react-native";
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = Text.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

import Root from "./Root.tsx";

Sentry.init({
  dsn: "https://7db2c06ee6ea56cae40a5bd963bad76b@o4506899216728065.ingest.us.sentry.io/4506899221970944",
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Sentry.wrap(Root));
