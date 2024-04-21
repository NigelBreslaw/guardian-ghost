import * as Sentry from "@sentry/react-native";
import { registerRootComponent } from "expo";
import App from "./App.tsx";

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: "https://7db2c06ee6ea56cae40a5bd963bad76b@o4506899216728065.ingest.us.sentry.io/4506899221970944",

  // Capture 100% of transactions in development, and 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 1.0,
  enabled: process.env.NODE_ENV !== "development",
  integrations: [new Sentry.ReactNativeTracing({ routingInstrumentation })],
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    profilesSampleRate: 1.0,
  },
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Sentry.wrap(App));
