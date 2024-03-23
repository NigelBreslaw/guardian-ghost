import AuthService from "@/app/authentication/AuthService.ts";
import DataService from "@/app/core/DataService.ts";
import BottomSheet from "@/app/screens/BottomSheet.tsx";
import { useAuthenticationStore } from "@/app/store/AuthenticationStore.ts";
import Login from "@/screens/Login.tsx";
import MainDrawer from "@/screens/MainDrawer.tsx";
import { useGlobalStateContext } from "@/state/GlobalState.tsx";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect } from "react";
import { Platform } from "react-native";

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  BottomSheet: { itemInstanceId: string | undefined; itemHash: number };
};

const RootStack = createStackNavigator<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default function RootScreen() {
  const globalState = useGlobalStateContext();
  const navigation = useNavigation();
  const authenticated = useAuthenticationStore((state) => state.authenticated);

  useEffect(() => {
    if (globalState.initComplete && !authenticated && !globalState.systemDisabled) {
      navigation.navigate("Login" as never);
    }
  }, [authenticated, globalState.initComplete, globalState.systemDisabled, navigation]);

  useEffect(() => {
    if (
      globalState.initComplete &&
      authenticated &&
      globalState.currentAccount &&
      globalState.definitionsReady &&
      AuthService.isAuthenticated()
    ) {
      console.log("trigger: download getProfile()");
      DataService.getInventory();
    }
  }, [authenticated, globalState.currentAccount, globalState.definitionsReady, globalState.initComplete]);

  return (
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
        <RootStack.Screen name="BottomSheet" component={BottomSheet} initialParams={{ itemInstanceId: "" }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
