import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import GlobalStateProvider from "@/state/GlobalState.tsx";
import RootScreen from "./RootScreen.tsx";
import { NavigationContainer } from "@react-navigation/native";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function App() {
  return (
    <GlobalStateProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GluestackUIProvider config={config}>
          <NavigationContainer>
            <RootScreen />
          </NavigationContainer>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GlobalStateProvider>
  );
}
