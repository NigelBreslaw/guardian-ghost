import GlobalStateProvider from "@/state/GlobalState.tsx";
import { config } from "@gluestack-ui/config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import RootScreen from "./RootScreen.tsx";

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
