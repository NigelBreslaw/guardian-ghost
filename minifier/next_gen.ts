import * as fs from "fs";
import path from "path";

// Enum for all the repeatedStrings
enum RepeatStringsName {
  Descriptions = "Descriptions",
  DisplaySources = "DisplaySources",
  ExpirationTooltip = "ExpirationTooltip",
  ItemTypeDisplayName = "ItemTypeDisplayName",
  ExpiredInActivityMessage = "ExpiredInActivityMessage",
  IconWaterMark = "IconWaterMark",
  IconWaterMarkFeatured = "IconWaterMarkFeatured",
  TraitIds = "TraitIds",
  UiItemDisplayStyle = "UiItemDisplayStyle",
  PlugCategoryIdentifier = "PlugCategoryIdentifier",
  UiPlugLabel = "UiPlugLabel",
  InsertionMaterialRequirementHash = "InsertionMaterialRequirementHash",
  StackUniqueLabel = "StackUniqueLabel",
  BucketTypeHash = "BucketTypeHash",
  Versions = "Versions",
  StatHash = "StatHash",
  StatGroupHash = "StatGroupHash",
  DamageTypeHashes = "DamageTypeHashes",
  ItemValue = "ItemValue",
  TooltipNotifications = "TooltipNotifications",
  RandomizedPlugSetHash = "RandomizedPlugSetHash",
  ReusablePlugSetHash = "ReusablePlugSetHash",
  SingleInitialItemHash = "SingleInitialItemHash",
  SocketCategoryHash = "SocketCategoryHash",
  SocketIndexes = "SocketIndexes",
  SocketCategories = "SocketCategories",
  PlugCategoryHash = "PlugCategoryHash",
  SocketEntries = "SocketEntries",
  SocketTypeHash = "SocketTypeHash",
  TalentGridHash = "TalentGridHash",
  Icons = "Icons",
}

// Interface (Schema) for the DestinyItemDefinition
interface JsonData {
  [key: string]: {
    flavorText: any;
    sockets: any;
    plug: any;
    perks: any;
    tooltipNotifications: any;
    setData: any;
    preview: any;
    traitIds: any;
    stats: any;

    quality?: {
      versions?: any[];
      displayVersionWatermarkIcons: any;
    };
    isFeaturedItem?: boolean;
    iconWatermark?: any;
    iconWatermarkFeatured?: string;
    uiItemDisplayStyle?: any;
    equippingBlock?: any;
    breakerType?: any;
    talentGrid?: any;
    damageTypeHashes?: any;
    redacted?: any;
    value?: {
      itemValue?: [itemHash?: string, quantity?: any];
    };
    displayProperties?: {
      iconSequences: any;
      name?: any;
      description?: any;
      icon?: any;
    };
    secondaryIcon?: any;
    secondarySpecial?: any;
    secondaryOverlay?: any;
    screenshot?: any;
    investmentStats?: [statTypeHash?: any, value?: any];
    nonTransferrable?: any;
    allowActions?: any;
    equippable?: any;
    doesPostmasterPullHaveSideEffects?: any;
    displaySource?: any;
    itemType?: any;
    itemSubType?: any;
    classType?: any;
    itemTypeDisplayName?: any;
    inventory?: {
      tierType?: any;
      maxStackSize?: any;
      bucketTypeHash?: any;
      stackUniqueLabel?: any;
      expirationTooltip?: any;
      expiredInActivityMessage?: any;
    };
  };
}

// Strip off the url so only the image name is left
// http:bungie.com/blah/blah/123.jpg -> 123.jpg
function stripImageUrl(url: string): string {
  const index = url.lastIndexOf("/");
  let shortUrl = url.substring(index + 1);

  // Change the extension
  // if (shortUrl.endsWith(".jpg")) {
  //   shortUrl = shortUrl.replace(".jpg", ".j");
  // } else if (shortUrl.endsWith(".png")) {
  //   shortUrl = shortUrl.replace(".png", ".p");
  // }

  return shortUrl;
}

export async function downloadJsonFile(url: string): Promise<any> {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to download JSON file (attempt ${attempt}/${maxAttempts}) from ${url}: ${error}`);
      if (attempt === maxAttempts) {
        process.exit(1);
      }
      const backoffMs = attempt * 500;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
  process.exit(1);
}

type ProcessedData = {
  helpers: { [key: string]: any };
  items: { [key: string]: any };
  version: number;
  id: string;
};

export function createMiniDefinition(jsonData: JsonData, uniqueKey: string): ProcessedData {
  // Dictionary of the repeat string arrays
  const repeatStrings: Record<RepeatStringsName, string[]> = {
    [RepeatStringsName.Descriptions]: [],
    [RepeatStringsName.DisplaySources]: [],
    [RepeatStringsName.ExpirationTooltip]: [],
    [RepeatStringsName.ItemTypeDisplayName]: [],
    [RepeatStringsName.ExpiredInActivityMessage]: [],
    [RepeatStringsName.IconWaterMark]: [],
    [RepeatStringsName.IconWaterMarkFeatured]: [],
    [RepeatStringsName.TraitIds]: [],
    [RepeatStringsName.UiItemDisplayStyle]: [],
    [RepeatStringsName.PlugCategoryIdentifier]: [],
    [RepeatStringsName.UiPlugLabel]: [],
    [RepeatStringsName.InsertionMaterialRequirementHash]: [],
    [RepeatStringsName.StackUniqueLabel]: [],
    [RepeatStringsName.BucketTypeHash]: [],
    [RepeatStringsName.Versions]: [],
    [RepeatStringsName.StatHash]: [],
    [RepeatStringsName.StatGroupHash]: [],
    [RepeatStringsName.DamageTypeHashes]: [],
    [RepeatStringsName.ItemValue]: [],
    [RepeatStringsName.TooltipNotifications]: [],
    [RepeatStringsName.RandomizedPlugSetHash]: [],
    [RepeatStringsName.ReusablePlugSetHash]: [],
    [RepeatStringsName.SingleInitialItemHash]: [],
    [RepeatStringsName.SocketCategoryHash]: [],
    [RepeatStringsName.SocketIndexes]: [],
    [RepeatStringsName.SocketCategories]: [],
    [RepeatStringsName.PlugCategoryHash]: [],
    [RepeatStringsName.SocketEntries]: [],
    [RepeatStringsName.SocketTypeHash]: [],
    [RepeatStringsName.TalentGridHash]: [],
    [RepeatStringsName.Icons]: [],
  };

  type RepeatStringsName =
    | "Descriptions"
    | "DisplaySources"
    | "ExpirationTooltip"
    | "ItemTypeDisplayName"
    | "ExpiredInActivityMessage"
    | "IconWaterMark"
    | "IconWaterMarkFeatured"
    | "TraitIds"
    | "UiItemDisplayStyle"
    | "PlugCategoryIdentifier"
    | "UiPlugLabel"
    | "InsertionMaterialRequirementHash"
    | "StackUniqueLabel"
    | "BucketTypeHash"
    | "Versions"
    | "StatHash"
    | "StatGroupHash"
    | "DamageTypeHashes"
    | "ItemValue"
    | "TooltipNotifications"
    | "RandomizedPlugSetHash"
    | "ReusablePlugSetHash"
    | "SingleInitialItemHash"
    | "SocketCategoryHash"
    | "SocketIndexes"
    | "SocketCategories"
    | "PlugCategoryHash"
    | "SocketEntries"
    | "SocketTypeHash"
    | "TalentGridHash"
    | "Icons";

  const repeatStringsMap: Record<RepeatStringsName, Map<string, number>> = {
    Descriptions: new Map(),
    DisplaySources: new Map(),
    ExpirationTooltip: new Map(),
    ItemTypeDisplayName: new Map(),
    ExpiredInActivityMessage: new Map(),
    IconWaterMark: new Map(),
    IconWaterMarkFeatured: new Map(),
    TraitIds: new Map(),
    UiItemDisplayStyle: new Map(),
    PlugCategoryIdentifier: new Map(),
    UiPlugLabel: new Map(),
    InsertionMaterialRequirementHash: new Map(),
    StackUniqueLabel: new Map(),
    BucketTypeHash: new Map(),
    Versions: new Map(),
    StatHash: new Map(),
    StatGroupHash: new Map(),
    DamageTypeHashes: new Map(),
    ItemValue: new Map(),
    TooltipNotifications: new Map(),
    RandomizedPlugSetHash: new Map(),
    ReusablePlugSetHash: new Map(),
    SingleInitialItemHash: new Map(),
    SocketCategoryHash: new Map(),
    SocketIndexes: new Map(),
    SocketCategories: new Map(),
    PlugCategoryHash: new Map(),
    SocketEntries: new Map(),
    SocketTypeHash: new Map(),
    TalentGridHash: new Map(),
    Icons: new Map(),
  };

  function getRepeatStringIndexMap(name: RepeatStringsName, s: string): number {
    if (!repeatStringsMap[name].has(s)) {
      repeatStringsMap[name].set(s, repeatStringsMap[name].size);
      repeatStrings[name].push(s);
    }

    return repeatStringsMap[name].get(s)!;
  }

  const processedData: ProcessedData = { helpers: {}, items: {}, version: 9, id: uniqueKey };

  const sortedDataKeys = Object.keys(jsonData).sort((a, b) => parseFloat(a) - parseFloat(b));

  for (const key of sortedDataKeys) {
    const item: any = {};

    if (jsonData.hasOwnProperty(key)) {
      const redacted = jsonData[key].redacted;
      if (redacted) {
        item.r = 1;
      }

      const displayProperties = jsonData[key].displayProperties;
      if (displayProperties) {
        const name = displayProperties.name;
        if (name) {
          item.n = name;
        }

        const description = displayProperties.description;
        if (description) {
          item.d = getRepeatStringIndexMap(RepeatStringsName.Descriptions, description);
        }

        const icon = displayProperties.icon;
        if (icon) {
          item.i = getRepeatStringIndexMap(RepeatStringsName.Icons, stripImageUrl(icon));
        }

        const iconSequences = displayProperties.iconSequences;
        if (iconSequences) {
          const is: any[] = [];
          for (const i of iconSequences) {
            const f: any[] = [];
            for (const frame of i.frames) {
              const icon = getRepeatStringIndexMap(RepeatStringsName.Icons, stripImageUrl(frame));
              f.push(icon);
            }
            is.push(f);
          }

          item.if = is;
        }
      }

      const secondaryIcon = jsonData[key].secondaryIcon;
      if (secondaryIcon) {
        item.si = stripImageUrl(secondaryIcon);
      }

      const secondaryOverlay = jsonData[key].secondaryOverlay;
      if (secondaryOverlay) {
        item.so = stripImageUrl(secondaryOverlay);
      }
      const secondarySpecial = jsonData[key].secondarySpecial;
      if (secondarySpecial) {
        item.ss = stripImageUrl(secondarySpecial);
      }

      const screenshot = jsonData[key].screenshot;
      if (screenshot) {
        item.s = stripImageUrl(screenshot);
      }

      const allowActions = jsonData[key].allowActions;
      if (!allowActions) {
        item.a = 0;
      }

      const flavorText = jsonData[key].flavorText;
      if (flavorText) {
        item.f = stripImageUrl(flavorText);
      }

      const isFeaturedItem = jsonData[key].isFeaturedItem;
      if (isFeaturedItem) {
        item.fi = 1;
      }

      const nonTransferrable = jsonData[key].nonTransferrable;
      if (nonTransferrable) {
        item.nt = 1;
      }

      const equippable = jsonData[key].equippable;
      if (equippable) {
        item.e = 1;
      }

      const doesPostmasterPullHaveSideEffects = jsonData[key].doesPostmasterPullHaveSideEffects;
      if (doesPostmasterPullHaveSideEffects) {
        item.pm = 1;
      }

      const displaySource = jsonData[key].displaySource;
      if (displaySource) {
        item.ds = getRepeatStringIndexMap(RepeatStringsName.DisplaySources, displaySource);
      }

      const itemType = jsonData[key].itemType;
      if (itemType) {
        item.it = itemType;
      }

      const itemSubType = jsonData[key].itemSubType;
      if (itemSubType) {
        item.is = itemSubType;
      }

      const classType = jsonData[key].classType;
      if (classType !== undefined) {
        item.c = classType;
      }

      const itemTypeDisplayName = jsonData[key].itemTypeDisplayName;
      if (itemTypeDisplayName) {
        item.itd = getRepeatStringIndexMap(RepeatStringsName.ItemTypeDisplayName, itemTypeDisplayName);
      }

      /// Values
      const itemValues = jsonData[key].value?.itemValue;

      if (itemValues) {
        const v: any[] = [];

        for (const itemValue of itemValues) {
          const val: any = {};

          const itemHash = itemValue.itemHash;

          if (itemHash === 0) {
            continue;
          }
          val.ih = getRepeatStringIndexMap(RepeatStringsName.ItemValue, itemHash);
          if (itemValue.quantity > 0) {
            val.q = itemValue.quantity;
          }

          if (Object.keys(val).length > 0) {
            v.push(val);
          }

          if (Object.keys(v).length > 0) {
            item.v = v;
          }
        }
      }

      /// inventory
      const inventory = jsonData[key].inventory;
      if (inventory) {
        const tierType = inventory?.tierType;
        if (tierType) {
          item.t = tierType;
        }

        const bucketTypeHash = inventory?.bucketTypeHash;
        if (bucketTypeHash) {
          item.b = getRepeatStringIndexMap(RepeatStringsName.BucketTypeHash, bucketTypeHash);
        }

        const stackUniqueLabel = inventory?.stackUniqueLabel;
        if (stackUniqueLabel) {
          item.su = getRepeatStringIndexMap(RepeatStringsName.StackUniqueLabel, stackUniqueLabel);
        }

        const expirationTooltip = inventory?.expirationTooltip;
        if (expirationTooltip) {
          item.et = getRepeatStringIndexMap(RepeatStringsName.ExpirationTooltip, expirationTooltip);
        }

        const expiredInActivityMessage = inventory?.expiredInActivityMessage;
        if (expiredInActivityMessage) {
          item.em = getRepeatStringIndexMap(RepeatStringsName.ExpiredInActivityMessage, expiredInActivityMessage);
        }

        const maxStackSize = inventory?.maxStackSize;
        if (maxStackSize) {
          item.m = maxStackSize;
        }
      }

      const investmentStats = jsonData[key].investmentStats;

      if (investmentStats) {
        const iv: any = {};

        for (const stat of investmentStats) {
          const value = stat.value;

          if (value !== undefined) {
            const statTypeHash = stat.statTypeHash;
            iv[getRepeatStringIndexMap(RepeatStringsName.StatHash, statTypeHash)] = value;
          }
        }

        if (Object.keys(iv).length > 0) {
          item.iv = iv;
        }
      }

      const damageTypeHashes = jsonData[key].damageTypeHashes;
      if (damageTypeHashes) {
        const dt: any[] = [];

        for (const damageHash of damageTypeHashes) {
          dt.push(getRepeatStringIndexMap(RepeatStringsName.DamageTypeHashes, damageHash));
        }

        if (dt.length > 0) {
          item.dt = dt;
        }
      }

      ///equipping block?
      const ammoType = jsonData[key].equippingBlock?.ammoType;
      if (ammoType) {
        item.at = ammoType;
      }

      const breakerType = jsonData[key].breakerType;
      if (breakerType) {
        item.bt = breakerType;
      }

      /// Is this needed any more?
      const talentGridHash = jsonData[key].talentGrid?.talentGridHash;
      if (talentGridHash && talentGridHash !== 0) {
        item.th = getRepeatStringIndexMap(RepeatStringsName.TalentGridHash, talentGridHash);
      }

      const uiItemDisplayStyle = jsonData[key].uiItemDisplayStyle;
      if (uiItemDisplayStyle) {
        item.ids = getRepeatStringIndexMap(RepeatStringsName.UiItemDisplayStyle, uiItemDisplayStyle);
      }

      const iconWatermark = jsonData[key].iconWatermark;
      if (iconWatermark) {
        item.iw = getRepeatStringIndexMap(RepeatStringsName.IconWaterMark, stripImageUrl(iconWatermark));
      }

      const iconWatermarkFeatured = jsonData[key].iconWatermarkFeatured;
      if (iconWatermarkFeatured) {
        item.iwf = getRepeatStringIndexMap(RepeatStringsName.IconWaterMarkFeatured, stripImageUrl(iconWatermarkFeatured));
      }

      // Quality
      const quality = jsonData[key].quality;
      if (quality) {
        const versions = quality.versions;

        if (versions) {
          const qv: any[] = [];
          for (const version of versions) {
            qv.push(getRepeatStringIndexMap(RepeatStringsName.Versions, version.powerCapHash));
          }
          if (qv.length > 0) {
            item.qv = qv;
          }
        }

        const displayVersionWatermarkIcons = quality.displayVersionWatermarkIcons;
        if (displayVersionWatermarkIcons) {
          const dvwi: any[] = [];

          for (const watermark of displayVersionWatermarkIcons) {
            if (!watermark) {
              continue;
            }
            dvwi.push(getRepeatStringIndexMap(RepeatStringsName.IconWaterMark, stripImageUrl(watermark)));
          }

          if (dvwi.length > 0) {
            item.dvwi = dvwi;
          }
        }
      }

      /// Stats
      const stats = jsonData[key].stats;
      if (stats) {
        const st: any = {};

        const itemStats = stats.stats;

        const s: any = {};
        const sortedStatKeys = Object.keys(itemStats).sort((a, b) => parseFloat(a) - parseFloat(b));
        for (const key of sortedStatKeys) {
          const keyAsNumber = Number(key) as any;
          s[getRepeatStringIndexMap(RepeatStringsName.StatHash, keyAsNumber)] = itemStats[key].value;
        }

        if (Object.keys(s).length > 0) {
          st.s = s;
        }

        const statGroupHash = stats.statGroupHash;
        if (statGroupHash) {
          st.sgs = getRepeatStringIndexMap(RepeatStringsName.StatGroupHash, statGroupHash);
        }

        if (Object.keys(st).length > 0) {
          item.st = st;
        }
      }

      const previewVendorHash = jsonData[key].preview?.previewVendorHash;

      if (previewVendorHash) {
        const p = previewVendorHash;
        if (p) {
          item.pv = p;
        }
      }

      /// setData
      const setData = jsonData[key].setData;
      if (setData) {
        const sD: any = {};

        const questLineName = setData.questLineName;
        if (questLineName) {
          sD.qN = questLineName;
        }

        if (sD) {
          item.sD = sD;
        }
      }

      const tooltipNotifications = jsonData[key].tooltipNotifications;
      if (tooltipNotifications) {
        const ttn: any[] = [];

        for (const tt of tooltipNotifications) {
          const ttString = tt.displayString;

          if (ttString) {
            ttn.push(getRepeatStringIndexMap(RepeatStringsName.TooltipNotifications, ttString));
          }

          /// NOTE!!! Ishtar only uses the first tooltip so no need to keep the others?
          /// Hmmm probably was used by some items in the detail view?
          break;
        }

        if (ttn.length > 0) {
          item.ttn = ttn;
        }
      }

      /// Perks
      const perks = jsonData[key].perks;
      if (perks) {
        const ph: any[] = [];

        for (const perk of perks) {
          const jPerk: any = {};
          const perkHash = perk.perkHash;
          if (perkHash) {
            jPerk.ph = perkHash;
          }
          const perkVisibility = perk.perkVisibility;
          if (perkVisibility) {
            jPerk.pv = perkVisibility;
          }

          if (Object.keys(jPerk).length > 0) {
            ph.push(jPerk);
          }
        }

        if (ph.length > 0) {
          item.ph = ph;
        }
      }

      const plug = jsonData[key].plug;
      if (plug) {
        const p: any = {};

        const plugCategoryHash = plug?.plugCategoryHash;
        if (plugCategoryHash) {
          p.p = getRepeatStringIndexMap(RepeatStringsName.PlugCategoryHash, plugCategoryHash);
        }

        /// NOTE: This change breaks the existing app. All it needs to do to get the correct
        /// PlugCategoryIdentifier is use the p.p index number to get the name from the
        /// PlugCategoryIdentifier array in the jsonDef
        const plugCategoryIdentifier = plug.plugCategoryIdentifier;
        if (plugCategoryIdentifier) {
          /// Intentionally call the function but don't save the result here. The p.p index will be the same.
          getRepeatStringIndexMap(RepeatStringsName.PlugCategoryIdentifier, plugCategoryIdentifier);
        }

        const uiPlugLabel = plug.uiPlugLabel;
        if (uiPlugLabel) {
          p.pl = getRepeatStringIndexMap(RepeatStringsName.UiPlugLabel, uiPlugLabel);
        }

        const insertionMaterialRequirementHash = plug?.insertionMaterialRequirementHash;
        if (insertionMaterialRequirementHash && insertionMaterialRequirementHash !== 0) {
          p.im = getRepeatStringIndexMap(
            RepeatStringsName.InsertionMaterialRequirementHash,
            insertionMaterialRequirementHash,
          );
        }

        if (Object.keys(p).length > 0) {
          item.p = p;
        }
      }

      const traitIds = jsonData[key].traitIds;
      if (traitIds) {
        const ti: any[] = [];

        for (const traitId of traitIds) {
          ti.push(getRepeatStringIndexMap(RepeatStringsName.TraitIds, traitId));
        }

        if (ti.length > 0) {
          item.tI = ti;
        }
      }

      /// NOTE:!!!! This changes the names of many socket properties and will break current Ishtar
      const sockets = jsonData[key].sockets;
      if (sockets) {
        const sk: any = {};

        const socketEntries = sockets?.socketEntries;

        const se: any[] = [];
        for (const socketEntry of socketEntries) {
          const socEntry: any = {};
          const p = socketEntry?.plugSources;

          if (p) {
            socEntry.p = p;
          }

          const st = socketEntry?.socketTypeHash;
          if (st) {
            socEntry.st = getRepeatStringIndexMap(RepeatStringsName.SocketTypeHash, st);
          }

          const rp = socketEntry.reusablePlugSetHash;
          if (rp) {
            socEntry.r = getRepeatStringIndexMap(RepeatStringsName.ReusablePlugSetHash, rp);
          }

          const rps = socketEntry.randomizedPlugSetHash;
          if (rps) {
            socEntry.ra = getRepeatStringIndexMap(RepeatStringsName.RandomizedPlugSetHash, rps);
          }

          const s = socketEntry.singleInitialItemHash;
          if (s && s !== 0) {
            socEntry.s = getRepeatStringIndexMap(RepeatStringsName.SingleInitialItemHash, s);
          }

          if (socEntry) {
            se.push(socEntry);
          }
        }

        if (se.length > 0) {
          sk.se = getRepeatStringIndexMap(RepeatStringsName.SocketEntries, JSON.stringify(se));
        }

        const scJson: any[] = [];
        for (const socketCategory of sockets.socketCategories) {
          const socCatEntry: any = {};

          const h = socketCategory?.socketCategoryHash;
          if (h) {
            socCatEntry.h = getRepeatStringIndexMap(RepeatStringsName.SocketCategoryHash, h);
          }

          /// NOTE: In ishtar you want to Json.parse the string you get to turn it into a json array.
          const socketIndexes = socketCategory?.socketIndexes;
          if (socketIndexes) {
            socCatEntry.i = getRepeatStringIndexMap(RepeatStringsName.SocketIndexes, JSON.stringify(socketIndexes));
            scJson.push(socCatEntry);
          }
        }
        if (scJson.length > 0) {
          /// NOTE: In ishtar you want to Json.parse the string you get to turn it into a json array.
          sk.sc = getRepeatStringIndexMap(RepeatStringsName.SocketCategories, JSON.stringify(scJson));
        }

        if (Object.keys(sk).length > 0) {
          item.sk = sk;
        }
      }
    }
    // Only add items with data
    if (Object.keys(item).length > 0) {
      processedData.items[key] = item; // Assign 'item' directly to the key
    }
  }

  // Add the repeatStrings to the output JSON
  // Create an array of enum names by filtering out invalid enum values
  const enumNames = Object.keys(RepeatStringsName).filter((key) =>
    isNaN(Number(key)),
  ) as (keyof typeof RepeatStringsName)[];

  // Iterate over the enum names
  for (const enumName of enumNames) {
    switch (enumName) {
      case RepeatStringsName.SocketIndexes: {
        const socketIndexesDefinition = repeatStrings[RepeatStringsName[enumName]];
        const si: number[][] = [];
        for (const socketIndex of socketIndexesDefinition) {
          si.push(JSON.parse(socketIndex) as number[]);
        }
        processedData.helpers[enumName] = si;

        break;
      }
      case RepeatStringsName.SocketCategories:
      case RepeatStringsName.SocketEntries: {
        const entries = repeatStrings[RepeatStringsName[enumName]];
        const si: JSON[][] = [];
        for (const entry of entries) {
          si.push(JSON.parse(entry) as JSON[]);
        }
        processedData.helpers[enumName] = si;
        break;
      }
      default: {
        const stringArray = repeatStrings[RepeatStringsName[enumName]];
        processedData.helpers[enumName] = stringArray;
      }
    }
  }
  return processedData;
}

export async function saveToJsonFile(data: any, filePath: string): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 0);
    await Bun.write(filePath, jsonString);
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to save data to file: ${error}`);
  }
}

async function useContentPaths(jsonWorldComponentContentPaths: any, uniqueKey: string): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const key in jsonWorldComponentContentPaths) {
    const definitionUrl = "https://bungie.com" + jsonWorldComponentContentPaths[key].DestinyInventoryItemDefinition;

    promises.push(downloadAndMinifyDefinition(definitionUrl, key, uniqueKey));
  }

  // Wait for all promises to resolve in parallel
  await Promise.all(promises);
}

async function downloadAndMinifyDefinition(definitionUrl: string, key: string, uniqueKey: string): Promise<void> {
  console.time(`${key} download-json`);
  const jsonData = await downloadJsonFile(definitionUrl);
  console.timeEnd(`${key} download-json`);

  console.time(`${key} parse-took:`);
  const processedData = createMiniDefinition(jsonData, uniqueKey);
  console.timeEnd(`${key} parse-took:`);

  const outputFilePath = path.join(__dirname, `json/${key}.json`);

  console.time(`${key} save-took:`);
  await saveToJsonFile(processedData, outputFilePath);
  console.timeEnd(`${key} save-took:`);

  console.log("");
}

async function main() {
  // Generate helper key exports for the app to import (build-time codegen)
  try {
    const allHelperKeys = Object.values(RepeatStringsName) as string[];
    const specialHelpers = new Set<string>([
      RepeatStringsName.SocketIndexes,
      RepeatStringsName.SocketCategories,
      RepeatStringsName.SocketEntries,
    ] as string[]);

    const targetDir = path.resolve(__dirname, "../native/app/core/generated");
    const targetFile = path.join(targetDir, "HelperKeys.ts");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileHeader = `// AUTO-GENERATED by minifier/next_gen.ts. Do not edit manually.\n`;
    // Build a single map with metadata for each helper key
    const mapObject: Record<string, { special: boolean }> = {};
    for (const key of allHelperKeys) {
      mapObject[key] = { special: specialHelpers.has(key) };
    }

    const helperMap = `export const HELPER_MAP = ${JSON.stringify(mapObject, null, 2)} as const;\n`;
    const helperKeyType = `export type HelperKey = keyof typeof HELPER_MAP;\n`;

    const fileBody = [fileHeader, helperMap, helperKeyType].join("\n");
    fs.writeFileSync(targetFile, fileBody, { encoding: "utf8" });
    console.log(`Generated helper keys at ${targetFile}`);
  } catch (error) {
    console.error("Failed to generate HelperKeys.ts:", error);
    // Non-fatal; continue with normal flow
  }

  // make directory called json
  const jsonPath = path.join(__dirname, `json`);
  if (!fs.existsSync(jsonPath)) {
    fs.mkdirSync(jsonPath);
  }

  try {
    console.time("download-manifest");

    const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";

    const jsonManifest = await downloadJsonFile(manifestUrl);
    
    // Check if this is running in GitHub Actions with the check flag
    if (process.argv.includes('--check-manifest')) {
        console.log("Checking manifest against live version...");
        const liveManifestUrl = "https://app.guardianghost.com/json/bungie_manifest.json";
        const liveManifest = await downloadJsonFile(liveManifestUrl);
        
        if (JSON.stringify(jsonManifest) === JSON.stringify(liveManifest)) {
            console.log("Manifest matches live version - no update needed");
            process.exit(1); // Clean exit - will not trigger GitHub Actions failure
        }
        console.log("Manifest differs from live version - proceeding with update");
    }
    const suffix = "_b";
    const id = `${jsonManifest.Response.jsonWorldComponentContentPaths["en"].DestinyInventoryItemDefinition}${suffix}`;
    console.timeEnd("download-manifest");

    const jsonWorldComponentContentPaths = jsonManifest.Response.jsonWorldComponentContentPaths;
    console.time("total-json-parse");
    await useContentPaths(jsonWorldComponentContentPaths, id);
    console.timeEnd("total-json-parse");

    const uniqueJsonManifest = {
      version: `${id}`,
    };

    const savePath = path.join(__dirname, `json/manifest.json`);
    await saveToJsonFile(uniqueJsonManifest, savePath);

    // Save the full Bungie manifest
    const bungieManifestPath = path.join(__dirname, `json/bungie_manifest.json`);
    await saveToJsonFile(jsonManifest, bungieManifestPath);

    // To avoid committing a 3MB JSON blob into this repo download the demo.json file
    // from the unintuitive.com site and save it to the json folder. This is only used
    // for the apps demo mode.
    const demoJsonUrl = "https://unintuitive.com/demo.json";
    const demoJson = await downloadJsonFile(demoJsonUrl);
    const saveDemoPath = path.join(__dirname, `json/demo.json`);
    await saveToJsonFile(demoJson, saveDemoPath);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
