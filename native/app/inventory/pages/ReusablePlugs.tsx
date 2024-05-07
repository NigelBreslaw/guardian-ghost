import { CategoryStyle, type SocketCategory, type SocketEntry } from "@/app/inventory/logic/Sockets.ts";
import { Image } from "expo-image";
import { View, StyleSheet } from "react-native";

const GAP = 10;
const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    gap: GAP,
  },
  text: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  column: {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: GAP,
  },
});

type PerkCircleProps = {
  icon: string | undefined;
  isEnabled: boolean;
};

function PerkCircle(props: PerkCircleProps) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: props.isEnabled ? "#5791BD" : "transparent",
      }}
    >
      <Image source={props.icon} style={{ width: 30, height: 30 }} />
    </View>
  );
}

type ReusablePlugsProps = {
  socketCategory: SocketCategory;
  socketEntries: SocketEntry[] | undefined;
};

export default function ReusablePlugs(props: ReusablePlugsProps) {
  switch (props.socketCategory.categoryStyle) {
    case CategoryStyle.Reusable: {
      return (
        <View style={styles.container}>
          {props.socketCategory.topLevelSockets.map((column, index) => {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <View key={index} style={styles.column}>
                {column.map((e, index) => {
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  return <PerkCircle key={index} icon={e.socketDefinition?.icon} isEnabled={e.isEnabled} />;
                })}
              </View>
            );
          })}
        </View>
      );
    }
    default: {
      return null;
    }
  }
}
