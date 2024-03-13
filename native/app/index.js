import * as Sentry from "@sentry/react-native";
import { registerRootComponent } from "expo";
import App from "./App.tsx";

Sentry.init({
  dsn: "https://7db2c06ee6ea56cae40a5bd963bad76b:7d7182201a659982c7b30a4512d4ad7a@o4506899216728065.ingest.us.sentry.io/4506899221970944",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Sentry.wrap(App));
