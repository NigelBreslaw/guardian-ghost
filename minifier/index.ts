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
  ReusablePlugSetHash = "ReusablePlugSetHash",
  SingleInitialItemHash = "SingleInitialItemHash",
  SocketCategoryHash = "SocketCategoryHash",
  SocketIndexes = "SocketIndexes",
  SocketCategories = "SocketCategories",
  PlugCategoryHash = "PlugCategoryHash",
  SocketEntries = "SocketEntries",
  SocketTypeHash = "SocketTypeHash",
  TalentGridHash = "TalentGridHash",
}

// These are the definition Ishtar downloads and uses as they are.
// Copied here so they can be downloaded to see if any are getting too large
enum NeededDefinitions {
  DestinyVendorDefinition = 0,
  DestinyVendorGroupDefinition = 1,
  DestinyItemCategoryDefinition = 2,
  DestinyClassDefinition = 3,
  DestinyRaceDefinition = 4,
  DestinyItemTierTypeDefinition = 5,
  DestinyObjectiveDefinition = 6,
  DestinySandboxPerkDefinition = 7,
  DestinySocketCategoryDefinition = 8,
  DestinySocketTypeDefinition = 9,
  DestinyProgressionDefinition = 10,
  DestinyActivityModifierDefinition = 11,
  DestinyArtifactDefinition = 12,
  DestinyFactionDefinition = 13,
  DestinyInventoryBucketDefinition = 14,
  DestinyMaterialRequirementSetDefinition = 15,
  DestinyMilestoneDefinition = 16,
  DestinyStatDefinition = 17,
  DestinyInventoryItemLiteDefinition = 18,
  DestinyPowerCapDefinition = 19,
  DestinySeasonDefinition = 20,
  DestinySeasonPassDefinition = 21,
  DestinyCollectibleDefinition = 22,
  DestinyPresentationNodeDefinition = 23,
  DestinyPlugSetDefinition = 24,
  DestinyRecordDefinition = 25,
  DestinyLoreDefinition = 26,
  DestinyDamageTypeDefinition = 27,
}

// Interface (Schema) for the DestinyItemDefinition
interface JsonData {
  [key: string]: {
    sockets: any;
    plug: any;
    perks: any;
    tooltipNotifications: any;
    setData: any;
    preview: any;
    traitIds: any;
    stats: any;
    displayVersionWatermarkIcons: any;
    quality?: {
      versions?: any[];
    };
    iconWatermark?: any;
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
  const shortUrl = url.substring(index + 1);
  return shortUrl;
}

// TODO: Update to retry a couple of times instead of failing right away
async function downloadJsonFile(url: string): Promise<any> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Failed to download JSON file: ${error}`);
  }
}

function createMiniDefinition(jsonData: JsonData): JSON {
  // Dictionary of the repeat string arrays
  const repeatStrings: Record<RepeatStringsName, string[]> = {
    [RepeatStringsName.Descriptions]: [],
    [RepeatStringsName.DisplaySources]: [],
    [RepeatStringsName.ExpirationTooltip]: [],
    [RepeatStringsName.ItemTypeDisplayName]: [],
    [RepeatStringsName.ExpiredInActivityMessage]: [],
    [RepeatStringsName.IconWaterMark]: [],
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
    [RepeatStringsName.ReusablePlugSetHash]: [],
    [RepeatStringsName.SingleInitialItemHash]: [],
    [RepeatStringsName.SocketCategoryHash]: [],
    [RepeatStringsName.SocketIndexes]: [],
    [RepeatStringsName.SocketCategories]: [],
    [RepeatStringsName.PlugCategoryHash]: [],
    [RepeatStringsName.SocketEntries]: [],
    [RepeatStringsName.SocketTypeHash]: [],
    [RepeatStringsName.TalentGridHash]: [],
  };

  // Send a repeat string and get a index value back
  function getRepeatStringIndex(name: RepeatStringsName, s: string): number {
    const index = repeatStrings[name].indexOf(s);
    if (index === -1) {
      repeatStrings[name].push(s);
      return getRepeatStringIndex(name, s);
    }

    return index;
  }

  const processedData: { [key: string]: any } = {};

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
        } else if (!redacted) {
          continue;
        }

        const description = displayProperties.description;
        if (description) {
          item.d = getRepeatStringIndex(RepeatStringsName.Descriptions, description);
        }

        const icon = displayProperties.icon;
        if (icon) {
          item.i = stripImageUrl(icon);
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
        item.ds = getRepeatStringIndex(RepeatStringsName.DisplaySources, displaySource);
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
      if (classType) {
        item.c = classType;
      }

      const itemTypeDisplayName = jsonData[key].itemTypeDisplayName;
      if (itemTypeDisplayName) {
        item.itd = getRepeatStringIndex(RepeatStringsName.ItemTypeDisplayName, itemTypeDisplayName);
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
          val.ih = getRepeatStringIndex(RepeatStringsName.ItemValue, itemHash);
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
          item.b = getRepeatStringIndex(RepeatStringsName.BucketTypeHash, bucketTypeHash);
        }

        const stackUniqueLabel = inventory?.stackUniqueLabel;
        if (stackUniqueLabel) {
          item.su = getRepeatStringIndex(RepeatStringsName.StackUniqueLabel, stackUniqueLabel);
        }

        const expirationTooltip = inventory?.expirationTooltip;
        if (expirationTooltip) {
          item.et = getRepeatStringIndex(RepeatStringsName.ExpirationTooltip, expirationTooltip);
        }

        const expiredInActivityMessage = inventory?.expiredInActivityMessage;
        if (expiredInActivityMessage) {
          item.em = getRepeatStringIndex(RepeatStringsName.ExpiredInActivityMessage, expiredInActivityMessage);
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

          if (value > 0) {
            const statTypeHash = stat.statTypeHash;
            iv[statTypeHash] = value;
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
          dt.push(getRepeatStringIndex(RepeatStringsName.DamageTypeHashes, damageHash));
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
        item.th = getRepeatStringIndex(RepeatStringsName.TalentGridHash, talentGridHash);
      }

      const uiItemDisplayStyle = jsonData[key].uiItemDisplayStyle;
      if (uiItemDisplayStyle) {
        item.ids = getRepeatStringIndex(RepeatStringsName.UiItemDisplayStyle, uiItemDisplayStyle);
      }

      const iconWatermark = jsonData[key].iconWatermark;
      if (iconWatermark) {
        item.iw = getRepeatStringIndex(RepeatStringsName.IconWaterMark, stripImageUrl(iconWatermark));
      }

      // Quality
      const quality = jsonData[key].quality;
      if (quality) {
        const versions = quality.versions;

        if (versions) {
          const qv: any[] = [];
          for (const version of versions) {
            qv.push(getRepeatStringIndex(RepeatStringsName.Versions, version.powerCapHash));
          }
          if (qv.length > 0) {
            item.qv = qv;
          }
        }

        const displayVersionWatermarkIcons = jsonData[key].displayVersionWatermarkIcons;
        if (displayVersionWatermarkIcons) {
          const dvwi: any[] = [];

          const sortedWatermarkKeys = Object.keys(displayVersionWatermarkIcons).sort(
            (a, b) => parseFloat(a) - parseFloat(b),
          );
          for (const watermark of sortedWatermarkKeys) {
            if (!watermark) {
              continue;
            }
            dvwi.push(getRepeatStringIndex(RepeatStringsName.IconWaterMark, stripImageUrl(watermark)));
          }

          if (dvwi.length > 0) {
            item.dvwi = dvwi;
          }
        }
      }

      /// Stats
      var stats = jsonData[key].stats;
      if (stats) {
        const st: any = {};

        const itemStats = stats.stats;

        const s: any = {};
        const sortedStatKeys = Object.keys(itemStats).sort((a, b) => parseFloat(a) - parseFloat(b));
        for (const key of sortedStatKeys) {
          s[getRepeatStringIndex(RepeatStringsName.StatHash, key)] = itemStats[key].value;
        }

        if (Object.keys(s).length > 0) {
          st.s = s;
        }

        var statGroupHash = stats.statGroupHash;
        if (statGroupHash) {
          st.sgs = getRepeatStringIndex(RepeatStringsName.StatGroupHash, statGroupHash);
        }

        if (Object.keys(st).length > 0) {
          item.st = st;
        }
      }

      var previewVendorHash = jsonData[key].preview?.previewVendorHash;

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
            ttn.push(getRepeatStringIndex(RepeatStringsName.TooltipNotifications, ttString));
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
          var perkVisibility = perk.perkVisibility;
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

      var plug = jsonData[key].plug;
      if (plug) {
        const p: any = {};

        const plugCategoryHash = plug?.plugCategoryHash;
        if (plugCategoryHash) {
          p.p = getRepeatStringIndex(RepeatStringsName.PlugCategoryHash, plugCategoryHash);
        }

        /// NOTE: This change breaks the existing app. All it needs to do to get the correct
        /// PlugCategoryIdentifier is use the p.p index number to get the name from the
        /// PlugCategoryIdentifier array in the jsonDef
        const plugCategoryIdentifier = plug.plugCategoryIdentifier;
        if (plugCategoryIdentifier) {
          /// Intentionally call the function but don't save the result here. The p.p index will be the same.
          getRepeatStringIndex(RepeatStringsName.PlugCategoryIdentifier, plugCategoryIdentifier);
        }

        var uiPlugLabel = plug.uiPlugLabel;
        if (uiPlugLabel) {
          p.pl = getRepeatStringIndex(RepeatStringsName.UiPlugLabel, uiPlugLabel);
        }

        const insertionMaterialRequirementHash = plug?.insertionMaterialRequirementHash;
        if (insertionMaterialRequirementHash && insertionMaterialRequirementHash !== 0) {
          p.im = getRepeatStringIndex(
            RepeatStringsName.InsertionMaterialRequirementHash,
            insertionMaterialRequirementHash,
          );
        }

        if (Object.keys(p).length > 0) {
          item.p = p;
        }
      }

      var traitIds = jsonData[key].traitIds;
      if (traitIds) {
        const ti: any[] = [];

        for (const traitId of traitIds) {
          ti.push(getRepeatStringIndex(RepeatStringsName.TraitIds, traitId));
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
            socEntry.st = getRepeatStringIndex(RepeatStringsName.SocketTypeHash, st);
          }

          const rp = socketEntry.reusablePlugSetHash;
          if (rp) {
            socEntry.r = getRepeatStringIndex(RepeatStringsName.ReusablePlugSetHash, rp);
          }

          const s = socketEntry.singleInitialItemHash;
          if (s && s !== 0) {
            socEntry.s = getRepeatStringIndex(RepeatStringsName.SingleInitialItemHash, s);
          }

          if (socEntry) {
            se.push(socEntry);
          }
        }

        if (se.length > 0) {
          sk.se = getRepeatStringIndex(RepeatStringsName.SocketEntries, JSON.stringify(se));
        }

        const scJson: any[] = [];
        for (const socketCategory of sockets.socketCategories) {
          const socCatEntry: any = {};

          var h = socketCategory?.socketCategoryHash;
          if (h) {
            socCatEntry.h = getRepeatStringIndex(RepeatStringsName.SocketCategoryHash, h);
          }

          /// NOTE: In ishtar you want to Json.parse the string you get to turn it into a json array.
          var socketIndexes = socketCategory?.socketIndexes;
          if (socketIndexes) {
            socCatEntry.i = getRepeatStringIndex(RepeatStringsName.SocketIndexes, JSON.stringify(socketIndexes));
            scJson.push(socCatEntry);
          }
        }
        if (scJson.length > 0) {
          /// NOTE: In ishtar you want to Json.parse the string you get to turn it into a json array.
          sk.sc = getRepeatStringIndex(RepeatStringsName.SocketCategories, JSON.stringify(scJson));
        }

        if (Object.keys(sk).length > 0) {
          item.sk = sk;
        }
      }
    }
    // Only add items with data
    if (Object.keys(item).length > 0) {
      processedData[key] = item; // Assign 'item' directly to the key
    }
  }

  // Add the repeatStrings to the output JSON
  // Create an array of enum names by filtering out invalid enum values
  const enumNames = Object.keys(RepeatStringsName).filter((key) =>
    isNaN(Number(key)),
  ) as (keyof typeof RepeatStringsName)[];

  // Iterate over the enum names
  for (const enumName of enumNames) {
    const stringArray = repeatStrings[RepeatStringsName[enumName]];
    processedData[enumName] = stringArray;
  }

  return processedData as JSON;
}

async function saveToJsonFile(data: any, filePath: string): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 0);
    await fs.promises.writeFile(filePath, jsonString, "utf-8");
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to save data to file: ${error}`);
  }
}

function loadJsonFile(path: any): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

async function useContentPaths(jsonWorldComponentContentPaths: any): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const key in jsonWorldComponentContentPaths) {
    const definitionUrl = "https://bungie.com" + jsonWorldComponentContentPaths[key].DestinyInventoryItemDefinition;

    promises.push(downloadAndMinifyDefinition(definitionUrl, key));
  }

  // Wait for all promises to resolve in parallel
  await Promise.all(promises);
}

// Used when investigating. This downloads and saves the original bungieItemDef files which are huge.
async function getFullDefinitions(): Promise<void> {
  const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";
  const jsonManifest = await downloadJsonFile(manifestUrl);

  const jsonWorldComponentContentPaths = jsonManifest.Response.jsonWorldComponentContentPaths;

  const promises: Promise<void>[] = [];

  for (const key in jsonWorldComponentContentPaths) {
    const definitionUrl = "https://bungie.com" + jsonWorldComponentContentPaths[key].DestinyInventoryItemDefinition;

    const jsonData = await downloadJsonFile(definitionUrl);
    await saveToJsonFile(jsonData, `full-sized-def-${key}.json`);
  }

  // Wait for all promises to resolve in parallel
  await Promise.all(promises);
}

async function getAllBungieDefinitions(): Promise<void> {
  const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";
  const jsonManifest = await downloadJsonFile(manifestUrl);

  const promises: Promise<void>[] = [];

  const enumNames = Object.keys(NeededDefinitions).filter((key) =>
    isNaN(Number(key)),
  ) as (keyof typeof NeededDefinitions)[];

  // Iterate over the enum names
  for (const enumName of enumNames) {
    const defUrl = jsonManifest.Response.jsonWorldComponentContentPaths.en[`${enumName}`];
    const definitionUrl = "https://bungie.com" + defUrl;

    const jsonData = await downloadJsonFile(definitionUrl);
    await saveToJsonFile(jsonData, `${enumName}.json`);
  }
}

async function downloadAndMinifyDefinition(definitionUrl: string, key: string): Promise<void> {
  console.time(`${key} download-json`);
  const jsonData = await downloadJsonFile(definitionUrl);
  console.timeEnd(`${key} download-json`);

  console.time(`${key} parse-took:`);
  const processedData = createMiniDefinition(jsonData);
  console.timeEnd(`${key} parse-took:`);

  const outputFilePath = path.join(__dirname, `../../frontend/public/json/${key}.json`);

  console.time(`${key} save-took:`);
  await saveToJsonFile(processedData, outputFilePath);
  console.timeEnd(`${key} save-took:`);

  console.log("");
}

async function isNewManifest(jsonManifest: JSON): Promise<boolean> {
  try {
    const manifestPath = path.join(__dirname, "../runner/bungieManifest.json");
    const oldJson = await loadJsonFile(manifestPath);

    return JSON.stringify(jsonManifest) !== JSON.stringify(oldJson);
  } catch (error) {
    console.error("Error comparing JSON files:", error);
    return false;
  }
}

async function main() {
  try {
    console.time("download-manifest");

    const manifestUrl = "https://www.bungie.net/Platform/Destiny2/Manifest/";
    const jsonManifest = await downloadJsonFile(manifestUrl);

    const isNew = await isNewManifest(jsonManifest);

    if (isNew) {
      const jsonManifest = await downloadJsonFile(manifestUrl);
      console.timeEnd("download-manifest");

      const jsonWorldComponentContentPaths = jsonManifest.Response.jsonWorldComponentContentPaths;
      console.time("total-json-parse");
      await useContentPaths(jsonWorldComponentContentPaths);
      console.timeEnd("total-json-parse");

      const time = new Date().toISOString();
      const manifest = { version: time };
      const savePath = path.join(__dirname, `../../frontend/public/json/manifest.json`);
      await saveToJsonFile(manifest, savePath);

      const manifestSavePath = path.join(__dirname, "../runner/bungieManifest.json");
      await saveToJsonFile(jsonManifest, manifestSavePath);
    } else {
      console.log("No new manifest detected");
      process.exit(1);
    }
  } catch (error) {
    console.error(error);
  }
}

main();
