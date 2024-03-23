import AuthService from "@/app/authentication/AuthService.ts";
import DataService from "@/app/core/DataService.ts";
import BottomSheet from "@/app/screens/BottomSheet.tsx";
import { useAccountStore } from "@/app/store/AccountStore.ts";
import { useAuthenticationStore } from "@/app/store/AuthenticationStore.ts";
import { useDefinitionsStore } from "@/app/store/DefinitionsStore.ts";
import { useGlobalStateStore } from "@/app/store/GlobalStateStore.ts";
import Login from "@/screens/Login.tsx";
import MainDrawer from "@/screens/MainDrawer.tsx";
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
  const systemDisabled = useGlobalStateStore((state) => state.systemDisabled);
  const initComplete = useGlobalStateStore((state) => state.initComplete);
  const currentAccount = useAccountStore((state) => state.currentAccount);
  const definitionsReady = useDefinitionsStore((state) => state.definitionsReady);
  const navigation = useNavigation();
  const authenticated = useAuthenticationStore((state) => state.authenticated);

  useEffect(() => {
    if (initComplete && !authenticated && !systemDisabled) {
      navigation.navigate("Login" as never);
    }
  }, [authenticated, initComplete, systemDisabled, navigation]);

  useEffect(() => {
    if (initComplete && authenticated && currentAccount && definitionsReady && AuthService.isAuthenticated()) {
      console.log("trigger: download getProfile()");
      DataService.getInventory();
    }
  }, [authenticated, currentAccount, definitionsReady, initComplete]);

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
