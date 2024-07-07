import { useGGStore } from "@/app/store/GGStore.ts";
import { TouchableWithoutFeedback, View, Image, StyleSheet } from "react-native";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { REFRESH_ICON } from "@/app/utilities/Constants.ts";
import Spinner from "@/app/UI/Spinner.tsx";

export default function RefreshButton() {
  "use memo";
  const refreshing = useGGStore((state) => state.refreshing);

  return (
    <TouchableWithoutFeedback onPress={() => getFullProfile()}>
      <View style={styles.iconButton}>
        <Image source={REFRESH_ICON} style={[styles.iconImage, { opacity: refreshing ? 0 : 1 }]} />
        {refreshing && (
          <View style={styles.spinner}>
            <Spinner size={52} />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    alignSelf: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 20,
    height: 20,
    alignSelf: "center",
  },
  spinner: {
    width: 20,
    height: 20,
    alignSelf: "center",
    position: "absolute",
  },
});
