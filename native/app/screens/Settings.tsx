import { View } from "react-native";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import type { ShowBottomSheetStringValues } from "@/app/store/SettingsSlice.ts";

export default function Settings() {
  const showBottomSheetPreference = useGGStore((state) => state.showBottomSheetPreference);
  const setBottomSheetPreference = useGGStore((state) => state.setBottomSheetPreference);
  return (
    <View className="flex-1 p-6  gap-3">
      <View>
        <Label className={cn("pb-1 native:pb-2 px-px")} nativeID={"label-for-show-bottom-sheet"}>
          Show the transfer buttons
        </Label>
      </View>
      <RadioGroup value={showBottomSheetPreference} onValueChange={setBottomSheetPreference} className="gap-3">
        <RadioGroupItemWithLabel value={"AUTOMATIC"} onLabelPress={setBottomSheetPreference} label="Auto" />
        <RadioGroupItemWithLabel
          value={"ALWAYS_SHOWING"}
          onLabelPress={setBottomSheetPreference}
          label="Always showing"
        />
        <RadioGroupItemWithLabel
          value={"ALWAYS_MINIMIZED"}
          onLabelPress={setBottomSheetPreference}
          label="Always minimized"
        />
      </RadioGroup>
    </View>
  );
}
function RadioGroupItemWithLabel({
  value,
  label,
  onLabelPress,
}: {
  value: ShowBottomSheetStringValues;
  label: string;
  onLabelPress: (ShowBottomSheetPreference: string) => void;
}) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={() => onLabelPress(value)}>
        {label}
      </Label>
    </View>
  );
}
