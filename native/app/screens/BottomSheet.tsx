import type { NavigationProp } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

export default function BottomSheet({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const refRBSheet = useRef<RBSheet | null>();

  useEffect(() => {
    if (refRBSheet.current) {
      refRBSheet.current.open();
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <RBSheet
        ref={(ref) => {
          refRBSheet.current = ref;
        }}
        closeOnDragDown={true}
        closeOnPressMask={true}
        onClose={() => navigation.goBack()}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "#000",
          },
        }}
      >
        {/* <YourOwnComponent /> */}
      </RBSheet>
    </View>
  );
}
