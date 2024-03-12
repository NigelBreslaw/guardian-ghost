import { useRef } from "react";
import { View, Button } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

export default function BottomSheet() {
  const refRBSheet = useRef<RBSheet | null>();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <Button
        title="OPEN BOTTOM SHEET"
        onPress={() => {
          if (refRBSheet.current) {
            refRBSheet.current.open();
          }
        }}
      />
      <RBSheet
        ref={(ref) => {
          refRBSheet.current = ref;
        }}
        closeOnDragDown={true}
        closeOnPressMask={false}
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
