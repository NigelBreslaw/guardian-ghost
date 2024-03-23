import * as SplashScreen from "expo-splash-screen";
import "react-native-gesture-handler"; // Avoid crash in production https://reactnavigation.org/docs/stack-navigator/#installation
SplashScreen.preventAutoHideAsync();
import RootScreen from "@/RootScreen.tsx";
import GlobalStateProvider from "@/state/GlobalState.tsx";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import InventoryStateProvider from "@/app/state/InventoryState.tsx";

// If the them is not set a white background keeps showing during screen rotation
function App() {
  return (
    <PaperProvider>
      <InventoryStateProvider>
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
      </InventoryStateProvider>
    </PaperProvider>
  );
}

export default App;
