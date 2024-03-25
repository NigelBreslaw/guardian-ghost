import * as SplashScreen from "expo-splash-screen";
import "react-native-gesture-handler"; // Avoid crash in production https://reactnavigation.org/docs/stack-navigator/#installation
SplashScreen.preventAutoHideAsync();
import RootScreen from "@/RootScreen.tsx";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { useEffect } from "react";
import StorageGG from "@/app/store/StorageGG.ts";
import AuthService from "@/app/authentication/AuthService.ts";
import { useGGStore } from "@/app/store/GGStore.ts";

// If the them is not set a white background keeps showing during screen rotation
function App() {
  useEffect(() => {
    const _storageService = StorageGG.getInstance();
    const _authService = AuthService.getInstance();
    useGGStore.getState().initDefinitions();
  }, []);

  return (
    <PaperProvider>
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
    </PaperProvider>
  );
}

export default App;
