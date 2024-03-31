import * as SplashScreen from "expo-splash-screen";
import "react-native-gesture-handler"; // Avoid crash in production https://reactnavigation.org/docs/stack-navigator/#installation
import { useGGStore } from "@/app/store/GGStore.ts";
import { NavigationContainer, type NavigationContainerRef, type Theme } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useRef } from "react";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import MainDrawer from "@/app/screens/MainDrawer.tsx";
import Login from "@/app/screens/Login.tsx";
import { Platform } from "react-native";
import BottomSheet from "@/app/screens/BottomSheet.tsx";
import type { UiCell } from "@/app/inventory/Common.ts";

type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  BottomSheet: { item: UiCell };
};

const RootStack = createStackNavigator<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

SplashScreen.preventAutoHideAsync();
useGGStore.getState().initDefinitions();
useGGStore.getState().initAuthentication();

const navigationContainerTheme: Theme = {
  colors: {
    primary: "#17101F",
    background: "#17101F",
    card: "#17101F",
    text: "#17101F",
    border: "#17101F",
    notification: "#17101F",
  },
  dark: false,
};
// If the them is not set a white background keeps showing during screen rotation
function App() {
  const definitionsReady = useGGStore((state) => state.definitionsReady);
  const authenticated = useGGStore((state) => state.authenticated);
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

  useEffect(() => {
    if (authenticated === "NO-AUTHENTICATION") {
      if (navigationRef.current) {
        navigationRef.current.navigate("Login");
      } else {
        console.error("No navigationRef");
      }
    } else if (authenticated === "AUTHENTICATED" && definitionsReady) {
      getFullProfile();
    }
  }, [authenticated, definitionsReady]);

  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef} theme={navigationContainerTheme}>
        <RootStack.Navigator>
          <RootStack.Group>
            <RootStack.Screen
              name="Root"
              component={MainDrawer}
              options={{
                headerShown: false,
              }}
            />
          </RootStack.Group>
          <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
            <RootStack.Screen name="Login" component={Login} options={{ title: "Login" }} />
          </RootStack.Group>
          <RootStack.Group
            screenOptions={{
              presentation: Platform.OS === "ios" ? "modal" : "transparentModal",
              headerShown: false,
              cardStyle: {
                backgroundColor: "transparent",
              },
            }}
          >
            <RootStack.Screen name="BottomSheet" component={BottomSheet} />
          </RootStack.Group>
        </RootStack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
