import RootScreen from "@/RootScreen.tsx";
import GlobalStateProvider from "@/state/GlobalState.tsx";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";

// If the them is not set a white background keeps showing during screen rotation
export default function App() {
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
