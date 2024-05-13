import { iconUrl, screenshotUrl } from "@/app/core/ApiResponse.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { ItemTypeDisplayName, itemsDefinition } from "@/app/store/Definitions.ts";

export type ViewData = {
  itemInstanceId: string | undefined;
  itemTypeDisplayName: string;
  screenshot: string;
  secondaryIcon: string;
  name: string;
};

export function buildViewData(destinyItem: DestinyItem): ViewData {
  const itemDef = itemsDefinition[destinyItem.itemHash];
  let screenshot = "";
  let secondaryIcon = "";

  if (destinyItem.overrideStyleItemHash !== undefined) {
    const overrideDef = itemsDefinition[destinyItem.overrideStyleItemHash];
    if (overrideDef) {
      const s = overrideDef?.s;
      const si = overrideDef?.si;
      if (s) {
        screenshot = `${screenshotUrl}${s}`;
      }
      if (si) {
        secondaryIcon = `${iconUrl}${si}`;
      }
    }
  }
  if (screenshot === "" && itemDef?.s) {
    screenshot = `${screenshotUrl}${itemDef?.s}`;
  }
  if (secondaryIcon === "" && itemDef?.si) {
    secondaryIcon = `${iconUrl}${itemDef?.si}`;
  }
  const name = itemDef?.n;
  const itd = itemDef?.itd;

  const viewData: ViewData = {
    itemInstanceId: destinyItem.itemInstanceId,
    screenshot: screenshot,
    secondaryIcon: secondaryIcon,
    name: name ? name.toLocaleUpperCase() : "",
    itemTypeDisplayName: itd ? ItemTypeDisplayName[itd]?.toLocaleUpperCase() ?? "" : "",
  };
  return viewData;
}
