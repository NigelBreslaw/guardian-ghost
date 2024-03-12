import * as Sentry from "@sentry/react-native";
import RootScreen from "@/RootScreen.tsx";
import GlobalStateProvider from "@/state/GlobalState.tsx";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";

Sentry.init({
  dsn: "https://7db2c06ee6ea56cae40a5bd963bad76b:7d7182201a659982c7b30a4512d4ad7a@o4506899216728065.ingest.us.sentry.io/4506899221970944",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// If the them is not set a white background keeps showing during screen rotation
function App() {
  return (
    <PaperProvider>
      <GlobalStateProvider>
        <NavigationContainer
          theme={{
            colors: {
              primary: "#17101F",
              background: "#17101F",
              card: "#17101F",
              text: "#17101F",
              border: "#17101F",
              notification: "#17101F",
            },
            dark: false,
          }}
        >
          <RootScreen />
        </NavigationContainer>
      </GlobalStateProvider>
    </PaperProvider>
  );
}

export default Sentry.wrap(App);
