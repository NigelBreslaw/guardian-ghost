import type { NavigationProp } from "@react-navigation/native";
import { addEventListener, useURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, TextInput, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { TouchableOpacity } from "react-native-gesture-handler";

import Text from "@/app/UI/Text.tsx";
import { stateID } from "@/app/store/Authentication/AuthenticationLogic.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { clientID, isLocalWeb, redirectURL } from "@/constants/env.ts";
import { LOGO_DARK, LOGO_LIGHT } from "@/app/utilities/Constants.ts";
import Spinner from "@/app/UI/Spinner.tsx";
import Psn from "@/images/svg/psn.svg";
import Xbox from "@/images/svg/xbox.svg";
import Steam from "@/images/svg/steam.svg";
import Epic from "@/images/svg/epic.svg";
import { getBungieUser } from "@/app/bungie/Account.ts";
import React from "react";

const CROSS_SAVE_IMAGE = require("../../images/cross-save.png");
const defaultSize = 30;

function startAuth(): void {
  function cancelLogin() {
    console.info("Failed to complete auth session");
    useGGStore.getState().cancelLogin();
  }

  const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${stateID}`;

  useGGStore.getState().startedLoginFlow();

  WebBrowser.openAuthSessionAsync(authURL, redirectURL)
    .then((result) => {
      if (result.type === "success") {
        // Used for Web and Android
        useGGStore.getState().createAuthenticatedAccount(result.url);
      } else if (result.type === "dismiss") {
        // iOS only on universal link callback
        if (Platform.OS === "android") {
          // User probably went back from the login webview without completing auth flow
          cancelLogin();
        }
      } else {
        // Used for all platforms
        cancelLogin();
      }
    })
    .catch((e) => {
      console.error("login issue?", e);
      cancelLogin();
    });
}

function LocalWebLogin() {
  const [localWebLoginText, setLocalWebLoginText] = useState("");
  const createAuthenticatedAccount = useGGStore((state) => state.createAuthenticatedAccount);

  return (
    <React.Fragment>
      <TextInput
        allowFontScaling={false}
        style={{ color: "white" }}
        value={localWebLoginText}
        onChangeText={(localWebLoginText) => {
          setLocalWebLoginText(localWebLoginText);
        }}
      />
      <View style={styles.spacer} />
      <TouchableOpacity onPress={() => createAuthenticatedAccount(localWebLoginText)}>
        <View style={styles.demoButton}>
          <Text style={styles.demoButtonText}>secret login</Text>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
}

type Props = {
  readonly navigation: NavigationProp<ReactNavigation.RootParamList>;
};

export default function Login({ navigation }: Props) {
  "use memo";
  const bungieMembershipProfiles = useGGStore((state) => state.bungieMembershipProfiles);
  const colorScheme = useColorScheme();
  const authenticated = useGGStore((state) => state.authenticated);
  const createAuthenticatedAccount = useGGStore((state) => state.createAuthenticatedAccount);
  const url = useURL();

  const logoSource = colorScheme === "light" ? LOGO_LIGHT : LOGO_DARK;

  const themeContainerStyle = colorScheme === "light" ? styles.topContainerLight : styles.topContainerDark;
  const themeTextStyle = colorScheme === "light" ? styles.textLight : styles.textDark;

  useEffect(() => {
    if (authenticated === "AUTHENTICATED" || authenticated === "DEMO-MODE") {
      navigation.goBack();
    }
  }, [authenticated, navigation]);

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (Platform.OS === "ios") {
        WebBrowser.dismissAuthSession();
        createAuthenticatedAccount(event.url);
      }
    };

    const listener = addEventListener("url", handleRedirect);

    return () => {
      listener.remove();
    };
  }, [createAuthenticatedAccount]);

  useEffect(() => {
    if (url) {
      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      }
    }
  }, [url]);

  return (
    <SafeAreaView style={themeContainerStyle}>
      <ScrollView bounces={false}>
        <View style={styles.container}>
          <View style={{ marginTop: 40 }} />
          <Image source={logoSource} style={{ width: 100, height: 100 }} />
          <View style={{ marginTop: 20 }} />

          {bungieMembershipProfiles.length === 0 && (
            <View>
              <Text style={{ ...themeTextStyle, fontSize: 50, fontWeight: "bold", letterSpacing: -2, lineHeight: 48 }}>
                {"Welcome to Guardian Ghost"}
              </Text>
              <View style={{ marginTop: 40 }} />
              <Text style={themeTextStyle}>To take your Destiny 2 experience to the next level, please login.</Text>
              <View style={{ marginTop: 20 }} />
              <TouchableOpacity
                disabled={authenticated === "LOGIN-FLOW"}
                onPress={() => startAuth()}
                onPressIn={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Login</Text>
                  {authenticated === "LOGIN-FLOW" && <Spinner />}
                </View>
              </TouchableOpacity>
              {isLocalWeb && <LocalWebLogin />}
              <View style={{ marginTop: 80 }} />
              <TouchableOpacity
                disabled={authenticated === "DEMO-MODE"}
                onPress={() => useGGStore.getState().setDemoMode()}
                onPressIn={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <View style={styles.demoButton}>
                  <Text style={styles.demoButtonText}>Demo Mode</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          {bungieMembershipProfiles.length > 0 && (
            <View>
              <Text style={themeTextStyle}>Select your Destiny 2 account</Text>
              <View style={{ marginTop: 20 }} />
              <View style={{ gap: 10 }}>
                {bungieMembershipProfiles.map((profile) => {
                  return (
                    <TouchableOpacity
                      key={profile.membershipId}
                      onPress={() => {
                        const bungieUser = getBungieUser(profile);
                        useGGStore.getState().setSuccessfulLogin(bungieUser);
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          width: "100%",
                          height: 50,
                          borderRadius: 25,
                          borderWidth: 1,
                          borderColor: "grey",
                          alignItems: "center",
                          backgroundColor: "#6750A4AA",
                        }}
                      >
                        <View style={{ width: 16 }} />
                        {profile.isCrossSavePrimary ? (
                          <Image
                            tintColor={"white"}
                            style={{ width: defaultSize, height: defaultSize }}
                            source={CROSS_SAVE_IMAGE}
                          />
                        ) : (
                          returnMembershipIcon(profile.membershipType)
                        )}
                        <Text style={{ marginLeft: 10, color: "white", fontSize: 16 }}>{profile.displayName}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

enum BungieMembershipType {
  None = 0,
  Xbox = 1,
  Psn = 2,
  Steam = 3,
  Blizzard = 4,
  Stadia = 5,
  Egs = 6,
  Demon = 10,
  BungieNext = 254,
}

function returnMembershipIcon(bungieMembershipType: BungieMembershipType) {
  switch (bungieMembershipType) {
    case BungieMembershipType.Xbox:
      return <Xbox width={defaultSize} height={defaultSize} />;
    case BungieMembershipType.Psn:
      return <Psn width={defaultSize} height={defaultSize} />;
    case BungieMembershipType.Steam:
      return <Steam width={defaultSize} height={defaultSize} />;
    case BungieMembershipType.Egs:
      return <Epic width={defaultSize} height={defaultSize} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  topContainerLight: {
    flex: 1,
    backgroundColor: "#F2F5FC",
  },
  topContainerDark: {
    flex: 1,
    backgroundColor: "#171321",
  },
  textLight: {
    color: "black",
    fontSize: 22,
  },
  textDark: {
    color: "#F1EDFE",
    fontSize: 22,
  },
  container: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
  },
  imageContainer: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  spacer: {
    marginTop: 10,
  },
  button: {
    width: "100%",
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6750A4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    includeFontPadding: false,
  },
  demoButton: {
    width: 130,
    height: 40,
    borderRadius: 20,
    borderColor: "#6750A4AA",
    borderWidth: 1,
    backgroundColor: "transparent",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 4,
  },
  demoButtonText: {
    color: "#6750A4",
    fontSize: 14,
    includeFontPadding: false,
  },
});
