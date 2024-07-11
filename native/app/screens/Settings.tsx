import * as React from "react";
import { View } from "react-native";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils.ts";

export default function Settings() {
  const [value, setValue] = React.useState("Auto");

  return (
    <View className="flex-1 p-6  gap-3">
      <View>
        <Label className={cn("pb-1 native:pb-2 px-px")} nativeID={"label-for-show-bottom-sheet"}>
          Show the transfer buttons
        </Label>
      </View>
      <RadioGroup value={value} onValueChange={setValue} className="gap-3">
        <RadioGroupItemWithLabel value="Auto" onLabelPress={() => setValue("Auto")} />
        <RadioGroupItemWithLabel value="Always showing" onLabelPress={() => setValue("Always showing")} />
        <RadioGroupItemWithLabel value="Always minimized" onLabelPress={() => setValue("Always minimized")} />
      </RadioGroup>
    </View>
  );
}
function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: {
  value: string;
  onLabelPress: () => void;
}) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}
