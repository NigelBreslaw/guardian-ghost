import { getProfile } from "@/app/bungie/BungieApi.ts";
import {
  type ProfileData,
  getProfileSchema,
  vaultBucketHashes,
  GuardiansSchema,
  GGCharacterType,
} from "@/app/bungie/Types.ts";
import type {
  DestinyItem,
  GGCharacterUiData,
  GuardianData,
  GuardianGear,
  GuardiansAndVault,
  VaultBucketHash,
} from "@/app/bungie/Types.ts";
import { type ItemDefinition, ItemDefinitionSchema, type SingleItemDefinition } from "@/app/core/Types.ts";
import {
  armorPageBuckets,
  generalPageBuckets,
  weaponsPageBuckets,
  type UiCell,
  type SeparatorCell,
  UiCellType,
  type DestinyIconData,
  getDamagetypeIconUri,
  type DestinyCell,
  type EmptyCell,
  type BlankCell,
} from "@/app/inventory/Common.ts";
import StorageGG from "@/app/storage/StorageGG.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
import { characterBuckets } from "@/bungie/Hashes.ts";
import { array, number, parse, safeParse, string } from "valibot";

class DataService {
  private static instance: DataService;
  static charactersAndVault: GuardiansAndVault = {
    vault: {
      characterId: "VAULT",
      emblemBackgroundPath: "",
      items: {
        // general
        138197802: {
          items: {},
        },
        // consumables
        1469714392: {
          items: {},
        },
        // mods
        3313201758: {
          items: {},
        },
        // special orders:
        1367666825: {
          items: {},
        },
      },
    },
    guardians: {},
  };
  static itemDefinition: ItemDefinition;
  static bucketTypeHashArray: Array<number>;
  static IconWaterMarks: Array<string>;
  static ItemTypeDisplayName: Array<string>;
  static profileData: ProfileData;

  private constructor() {
    DataService.setupItemDefinition();
  }

  private static async setupItemDefinition() {
    const p1 = performance.now();
    // Is there a saved definition?
    try {
      const loadedDefinition = await StorageGG.getData("ITEM_DEFINITION", "getItemDefinition()");
      const p3 = performance.now();
      console.log("loaded setupItemDefinition() took:", (p3 - p1).toFixed(5), "ms");
      const itemDefinition = parse(ItemDefinitionSchema, loadedDefinition);
      const p4 = performance.now();
      console.log("parse itemDef() took:", (p4 - p3).toFixed(4), "ms");
      DataService.itemDefinition = itemDefinition;
      DataService.setUpItemDefinition();
      useGGStore.getState().setDefinitionsReady(true);
      const p2 = performance.now();
      console.log("Full itemDef ready took:", (p2 - p1).toFixed(5), "ms");
      return;
    } catch (e) {
      console.error("No saved itemDefinition. Downloading new version...", e);
    }

    try {
      const downloadedDefinition = await getCustomItemDefinition();
      const itemDefinition = parse(ItemDefinitionSchema, downloadedDefinition);
      await StorageGG.setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
      DataService.itemDefinition = itemDefinition;
      DataService.setUpItemDefinition();
      useGGStore.getState().setDefinitionsReady(true);
    } catch (e) {
      console.error("Failed to download and save itemDefinition", e);
    }
    const p2 = performance.now();
    console.log("downloadedSetupItemDefinition() took:", (p2 - p1).toFixed(5), "ms");
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }

    return DataService.instance;
  }

  static setUpItemDefinition() {
    try {
      const parsedBucketTypeHash = parse(array(number()), DataService.itemDefinition.helpers.BucketTypeHash);
      DataService.bucketTypeHashArray = parsedBucketTypeHash;
      const IconWaterMarks = parse(array(string()), DataService.itemDefinition.helpers.IconWaterMark);
      DataService.IconWaterMarks = IconWaterMarks;
      const ItemTypeDisplayName = parse(array(string()), DataService.itemDefinition.helpers.ItemTypeDisplayName);
      DataService.ItemTypeDisplayName = ItemTypeDisplayName;
    } catch (e) {
      console.error("Failed to setUpItemDefinition", e);
    }
  }

  public static async getInventory() {
    useGGStore.getState().setRefreshing(true);
    try {
      const p1 = performance.now();
      const profile = await getProfile();
      const p2 = performance.now();

      console.log("getProfile() took:", (p2 - p1).toFixed(4), "ms");
      const p3 = performance.now();

      const validatedProfile = parse(getProfileSchema, profile);
      const p4 = performance.now();
      console.log("parse() took:", (p4 - p3).toFixed(4), "ms");

      const p5 = performance.now();
      DataService.profileData = validatedProfile;
      DataService.processProfile(validatedProfile);
      DataService.defineCharactersAndVault();
      DataService.processCharacterEquipment(validatedProfile);
      DataService.processCharacterInventory(validatedProfile);
      DataService.processVaultInventory(validatedProfile);
      DataService.buildInventoryTabData();
      const p6 = performance.now();
      console.log("processing all profile data took:", (p6 - p5).toFixed(5), "ms");
    } catch (e) {
      console.error("Failed to validate profile!", e);
    } finally {
      useGGStore.getState().setRefreshing(false);
    }
  }

  private static processProfile(profile: ProfileData) {
    const characters = profile.Response.characters.data;
    for (const character in characters) {
      const characterData = characters[character];

      if (characterData) {
        const initialCharacterData = {
          data: characterData,
          items: {} as { [key: number]: { equipped: DestinyItem | null; inventory: Array<DestinyItem> } },
        };

        // Now create all the buckets
        for (const bucket of characterBuckets) {
          initialCharacterData.items[bucket] = { equipped: null, inventory: [] };
        }

        DataService.charactersAndVault.guardians[character] = initialCharacterData;
      }
    }
  }

  private static defineCharactersAndVault() {
    // First flesh out the guardians
    const characters = DataService.charactersAndVault.guardians;

    for (const character in characters) {
      const fullCharacter = characters[character]?.data;

      if (fullCharacter) {
        const parseCharacter = safeParse(GuardiansSchema, fullCharacter);
        if (parseCharacter.success) {
          DataService.addCharacterDefinition(parseCharacter.output);
        }
      }
    }
  }

  private static addCharacterDefinition(guardianData: GuardianData): GGCharacterUiData {
    const data: GGCharacterUiData = {
      characterId: guardianData.characterId,
      guardianClassType: guardianData.classType,
      genderType: guardianData.genderType,
      raceType: guardianData.raceType,
      emblem: "",
      lastActiveCharacter: false,
      ggCharacterType: GGCharacterType.Guardian,
    };

    return data;
  }

  private static processCharacterEquipment(profile: ProfileData) {
    const charactersEquipment = profile.Response.characterEquipment.data;
    for (const character in charactersEquipment) {
      const characterEquipment = charactersEquipment[character];

      if (characterEquipment) {
        const characterItems = DataService.charactersAndVault.guardians[character];
        for (const item of characterEquipment.items) {
          if (characterItems) {
            characterItems.items[item.bucketHash] = { equipped: item, inventory: [] };
          }
        }
      }
    }
  }

  private static processCharacterInventory(profile: ProfileData) {
    const charactersInventory = profile.Response.characterInventories.data;
    for (const character in charactersInventory) {
      const characterInventory = charactersInventory[character];

      if (characterInventory) {
        const characterItems = DataService.charactersAndVault.guardians[character];
        for (const item of characterInventory.items) {
          if (characterItems) {
            const hasBucket = Object.hasOwn(characterItems.items, item.bucketHash);
            if (!hasBucket) {
              characterItems.items[item.bucketHash] = { equipped: null, inventory: [] };
            }
            characterItems.items[item.bucketHash]?.inventory.push(item);
          }
        }
      }
    }
  }

  private static processVaultInventory(profile: ProfileData) {
    const vaultInventory = profile.Response.profileInventory.data.items;
    if (vaultInventory) {
      const vaultItems = DataService.charactersAndVault.vault.items;

      for (const item of vaultInventory) {
        const itemHash = item.itemHash.toString();
        const data = DataService.itemDefinition.items[itemHash] as SingleItemDefinition;

        const bucketHashIndex = data.b;
        if (bucketHashIndex !== undefined) {
          const definitionBucketHash = DataService.bucketTypeHashArray[bucketHashIndex];

          if (definitionBucketHash) {
            if (!vaultBucketHashes.includes(item.bucketHash)) {
              console.error("item.bucketHash not in vaultBucketHashes", item.bucketHash);
              continue;
            }
            const hasBucket = Object.hasOwn(vaultItems[item.bucketHash as VaultBucketHash].items, definitionBucketHash);
            if (!hasBucket) {
              vaultItems[item.bucketHash as VaultBucketHash].items[definitionBucketHash] = {
                equipped: null,
                inventory: [],
              };
            }

            vaultItems[item.bucketHash as VaultBucketHash].items[definitionBucketHash]?.inventory.push(item);
          }
        }
      }
    }
  }

  private static buildInventoryTabData() {
    const p1 = performance.now();
    const weaponsPageData = DataService.buildUIData(weaponsPageBuckets);
    const armorPageData = DataService.buildUIData(armorPageBuckets);
    const generalPageData = DataService.buildUIData(generalPageBuckets);
    const p2 = performance.now();
    console.log("buildInventoryTabData took:", (p2 - p1).toFixed(4), "ms");
    useGGStore.getState().setAllInventoryPageData(weaponsPageData, armorPageData, generalPageData);
    const p3 = performance.now();
    console.log("setInventoryTabData took:", (p3 - p2).toFixed(4), "ms");
  }

  private static buildUIData(itemBuckets: Array<number>): Array<Array<UiCell>> {
    const characterDataArray: Array<Array<UiCell>> = [];
    const columns = 4;

    for (const character in DataService.charactersAndVault.guardians) {
      const characterData = DataService.charactersAndVault.guardians[character];
      if (characterData) {
        const dataArray: Array<UiCell> = [];

        for (const bucket of itemBuckets) {
          // create section separators
          for (let i = 0; i < columns; i++) {
            const separator: SeparatorCell = {
              id: `${bucket}_separator_${i}`,
              type: UiCellType.Separator,
            };
            dataArray.push(separator);
          }

          const bucketItems = characterData.items[bucket];
          if (bucketItems) {
            const equipped = bucketItems.equipped;
            let equipItem: DestinyIconData | null = null;

            if (equipped) {
              equipItem = DataService.returnDestinyIconData(equipped);
              const equippedCell: DestinyCell = {
                ...equipItem,
                id: `${bucket}_equipped`,
                type: UiCellType.DestinyCell,
              };
              dataArray.push(equippedCell);
            } else {
              const emptyCell: EmptyCell = {
                id: `${bucket}_equipped`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }

            // If artifact (1506418338) don't add any more items.
            if (bucket === 1506418338) {
              continue;
            }

            const inventoryRowData0 = DataService.returnInventoryRow(bucketItems, 0);

            for (let i = 0; i < columns - 1; i++) {
              const item = inventoryRowData0[i];
              if (item) {
                const destinyCell: DestinyCell = {
                  ...item,
                  id: `${bucket}_row0_${i}`,
                  type: UiCellType.DestinyCell,
                };
                dataArray.push(destinyCell);
              } else {
                const emptyCell: EmptyCell = {
                  id: `${bucket}_row0_${i}`,
                  type: UiCellType.EmptyCell,
                };
                dataArray.push(emptyCell);
              }
            }

            const inventoryRowData1 = DataService.returnInventoryRow(bucketItems, 1);

            const blankCell1: BlankCell = {
              id: `${bucket}_row1_blank`,
              type: UiCellType.BlankCell,
            };
            dataArray.push(blankCell1);

            for (let i = 0; i < columns - 1; i++) {
              const item = inventoryRowData1[i];
              if (item) {
                const destinyCell: DestinyCell = {
                  ...item,
                  id: `${bucket}_row1_${i}`,
                  type: UiCellType.DestinyCell,
                };
                dataArray.push(destinyCell);
              } else {
                const emptyCell: EmptyCell = {
                  id: `${bucket}_row1_${i}`,
                  type: UiCellType.EmptyCell,
                };
                dataArray.push(emptyCell);
              }
            }

            const inventoryRowData2 = DataService.returnInventoryRow(bucketItems, 2);

            const blankCell2: BlankCell = {
              id: `${bucket}_row2_blank`,
              type: UiCellType.BlankCell,
            };
            dataArray.push(blankCell2);

            for (let i = 0; i < columns - 1; i++) {
              const item = inventoryRowData2[i];
              if (item) {
                const destinyCell: DestinyCell = {
                  ...item,
                  id: `${bucket}_row2_${i}`,
                  type: UiCellType.DestinyCell,
                };
                dataArray.push(destinyCell);
              } else {
                const emptyCell: EmptyCell = {
                  id: `${bucket}_row2_${i}`,
                  type: UiCellType.EmptyCell,
                };
                dataArray.push(emptyCell);
              }
            }
          } else {
            const emptyCell: EmptyCell = {
              id: `${bucket}_equipped`,
              type: UiCellType.EmptyCell,
            };
            dataArray.push(emptyCell);
            for (let i = 0; i < columns - 1; i++) {
              const emptyCell: EmptyCell = {
                id: `${bucket}_row1_${i}`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }

            // Create tow more rows of empty cells
            for (let r = 0; r < 2; r++) {
              const blankCell1: BlankCell = {
                id: `${bucket}_row${r + 1}_blank`,
                type: UiCellType.BlankCell,
              };
              dataArray.push(blankCell1);
              for (let i = 0; i < columns - 1; i++) {
                const emptyCell: EmptyCell = {
                  id: `${bucket}_row${r + 1}_${i}`,
                  type: UiCellType.EmptyCell,
                };
                dataArray.push(emptyCell);
              }
            }
          }
        }
        characterDataArray.push(dataArray);
      }
    }
    // Now build the vault data
    const vaultData = DataService.returnVaultData(itemBuckets);
    characterDataArray.push(vaultData);

    return characterDataArray;
  }

  private static returnVaultData(itemBuckets: Array<number>): Array<UiCell> {
    const vaultData = DataService.charactersAndVault.vault;
    const dataArray: Array<UiCell> = [];
    const columns = 5;

    for (const bucket of itemBuckets) {
      const bucketItems = vaultData.items[138197802].items[bucket];
      if (bucketItems) {
        for (let i = 0; i < columns; i++) {
          const separator: SeparatorCell = {
            id: `${bucket}_separator_${i}`,
            type: UiCellType.Separator,
          };
          dataArray.push(separator);
        }

        const totalRows = Math.ceil(bucketItems.inventory.length / columns);

        for (let i = 0; i < totalRows; i++) {
          const rowData = DataService.returnInventoryRow(bucketItems, i, columns);
          for (let j = 0; j < columns; j++) {
            const item = rowData[j];
            if (item) {
              const destinyCell: DestinyCell = {
                ...item,
                id: `${bucket}_row1_${i}_${j}`,
                type: UiCellType.DestinyCell,
              };
              dataArray.push(destinyCell);
            } else {
              const emptyCell: EmptyCell = {
                id: `${bucket}_row1_${i}_${j}`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }
          }
        }
      }
    }

    return dataArray;
  }

  private static returnDestinyIconData(item: DestinyItem): DestinyIconData {
    const definition = DataService.itemDefinition.items[item.itemHash] as SingleItemDefinition;
    const itemInstanceId = item?.itemInstanceId;

    if (itemInstanceId) {
      const itemComponent = DataService.profileData.Response.itemComponents.instances.data[itemInstanceId];
      if (itemComponent) {
        // if it has a version number get the watermark from the array. If it does not then see if the definition has an 'iconWatermark'
        const versionNumber = item.versionNumber;

        let watermark: string | undefined = undefined;
        if (versionNumber !== undefined) {
          const dvwi = definition.dvwi;

          if (dvwi) {
            const index = dvwi[versionNumber];
            if (index !== undefined) {
              watermark = DataService.IconWaterMarks[index];
            }
          }
        } else {
          const iconWatermark = definition.iw;
          if (iconWatermark) {
            watermark = DataService.IconWaterMarks[iconWatermark];
          }
        }

        if (watermark) {
          watermark = `https://www.bungie.net/common/destiny2_content/icons/${watermark}`;
        }

        const iconData: DestinyIconData = {
          itemHash: item.itemHash,
          itemInstanceId: item.itemInstanceId,
          icon: `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`,
          primaryStat: itemComponent.primaryStat?.value.toString() || "",
          calculatedWaterMark: watermark,
          damageTypeIconUri: getDamagetypeIconUri(itemComponent.damageType),
        };
        return iconData;
      }

      console.error("No itemComponent found for item", item);
    }

    if (definition) {
      const nonInstancedItem: DestinyIconData = {
        itemHash: item.itemHash,
        itemInstanceId: undefined,
        icon: `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`,
        primaryStat: "",
        calculatedWaterMark: "",
        damageTypeIconUri: null,
      };

      return nonInstancedItem;
    }

    const emptyData: DestinyIconData = {
      itemHash: item.itemHash,
      itemInstanceId: undefined,
      icon: "",
      primaryStat: "",
      calculatedWaterMark: "",
      damageTypeIconUri: null,
    };

    console.error("returnDestinyIconData() error", item);
    return emptyData;
  }

  private static returnInventoryRow(characterGear: GuardianGear, column: number, rowWidth = 3): Array<DestinyIconData> {
    const rowData: Array<DestinyIconData> = [];

    const startIndex = column * rowWidth;
    const endIndex = startIndex + rowWidth;

    for (let i = startIndex; i < endIndex; i++) {
      const item = characterGear.inventory[i];
      if (item) {
        const iconData = DataService.returnDestinyIconData(item);
        rowData.push(iconData);
      }
    }

    return rowData;
  }
}

export default DataService;
