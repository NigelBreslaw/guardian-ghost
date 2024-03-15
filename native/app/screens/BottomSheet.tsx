import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

export default function BottomSheet({
  navigation,
  route,
}: {
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  route: RouteProp<ReactNavigation.RootParamList, "BottomSheet">;
}) {
  const refRBSheet = useRef<RBSheet | null>();
  const { itemInstanceId } = route.params;

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
        <Text>{itemInstanceId}</Text>
      </RBSheet>
    </View>
  );
}
