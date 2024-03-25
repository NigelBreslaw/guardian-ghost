import AuthService from "@/app/authentication/AuthService.ts";
import BottomSheet from "@/app/screens/BottomSheet.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
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
  const systemDisabled = useGGStore((state) => state.systemDisabled);
  const initComplete = useGGStore((state) => state.initComplete);
  const currentAccount = useGGStore((state) => state.currentAccount);
  const definitionsReady = useGGStore((state) => state.definitionsReady);
  const authenticated = useGGStore((state) => state.authenticated);
  const navigation = useNavigation();

  useEffect(() => {
    if (initComplete && !authenticated && !systemDisabled) {
      navigation.navigate("Login" as never);
    }
  }, [authenticated, initComplete, systemDisabled, navigation]);

  useEffect(() => {
    if (initComplete && authenticated && currentAccount && definitionsReady && AuthService.isAuthenticated()) {
      console.log("trigger: download getProfile()");
      useGGStore.getState().getProfile();
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
