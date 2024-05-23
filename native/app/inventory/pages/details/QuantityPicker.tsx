import { View, Text, TextInput, StyleSheet } from "react-native";

import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { useGGStore } from "@/app/store/GGStore.ts";

const styles = StyleSheet.create({
  quantityRoot: {
    left: 20,
    position: "absolute",
    bottom: 20,
  },
  quantity: {
    width: 100,
    height: 30,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "grey",
  },
  quantityText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
    height: "100%",
    width: "100%",
    paddingLeft: 5,
  },
  quantityTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});

type QuantityPickerProps = {
  readonly destinyItem: DestinyItem;
};

function QuantityPicker(props: QuantityPickerProps) {
  const quantity = useGGStore((state) => state.quantityToTransfer);

  return (
    <View style={styles.quantityRoot}>
      <Text style={styles.quantityTitle}>{"Quantity to transfer:"}</Text>
      <View style={styles.quantity}>
        <TextInput
          inputMode="numeric"
          style={styles.quantityText}
          value={quantity === 0 ? "" : quantity.toString()}
          onChangeText={(value) => {
            const maxAmount = useGGStore.getState().findMaxQuantityToTransfer(props.destinyItem);
            const valueAsNumber = Number.parseInt(value);
            if (valueAsNumber > maxAmount) {
              useGGStore.getState().setQuantityToTransfer(maxAmount);
            } else if (valueAsNumber < 1 || Number.isNaN(valueAsNumber)) {
              useGGStore.getState().setQuantityToTransfer(0);
            } else {
              useGGStore.getState().setQuantityToTransfer(valueAsNumber);
            }
          }}
        />
      </View>
    </View>
  );
}

export default QuantityPicker;
