import { PaperProvider } from "react-native-paper";
import GlobalStateProvider from "@/state/GlobalState.tsx";
import RootScreen from "@/RootScreen.tsx";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <PaperProvider>
      <GlobalStateProvider>
        <NavigationContainer>
          <RootScreen />
        </NavigationContainer>
      </GlobalStateProvider>
    </PaperProvider>
  );
}
