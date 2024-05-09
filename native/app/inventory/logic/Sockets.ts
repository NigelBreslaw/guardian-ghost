import type { DestinyItem, StatsCollection, SocketDefinition } from "@/app/inventory/logic/Types.ts";
import type { PlugSet } from "@/app/core/GetProfile.ts";
import {
  Descriptions,
  DestinySocketCategoryDefinition,
  Icons,
  ItemTypeDisplayName,
  ReusablePlugSetHash,
  SingleInitialItemHash,
  SocketCategories,
  SocketCategoryHash,
  SocketEntries,
  SocketIndexes,
  SocketTypeHash,
  StatHash,
  itemsDefinition,
  rawProfileData,
} from "@/app/store/Definitions.ts";
import { getBitmaskValues } from "@/app/utilities/Helpers.ts";
import { iconUrl } from "@/app/core/ApiResponse.ts";

export enum CategoryStyle {
  Unknown = 0,
  Reusable = 1,
  Consumable = 2,
  Unlockable = 3,
  Intrinsic = 4,
  EnergyMeter = 5,
  LargePerk = 6,
  Abilities = 7,
  Supers = 8,
}

type SocketMap = {
  socketIndex: number;
  socketTypeHash: number | null;
};

enum SocketPlugSources {
  /// There's no way we can detect to insert new plugs.
  None = 0, // None: 0

  /// Use plugs found in the player's inventory, based on the socket type rules
  /// (see DestinySocketTypeDefinition for more info)
  /// Note that a socket - like Shaders - can have *both* reusable plugs and inventory
  /// items inserted theoretically.
  InventorySourced = 1, // InventorySourced: 1

  /// Use the DestinyItemSocketsComponent.sockets.reusablePlugs property to determine
  /// which plugs are valid for this socket. This may have to be combined with other
  /// sources, such as plug sets, if those flags are set.
  /// Note that "Reusable" plugs may not necessarily come from a plug set, nor from
  /// the "reusablePlugItems" in the socket's Definition data. They can sometimes be
  /// "randomized" in which case the only source of truth at the moment is still the
  /// runtime DestinyItemSocketsComponent.sockets.reusablePlugs property.

  /// NOTE: I moved the ReusablePlugItems below the others so in Sockets it would be sorted last.
  /// That then fixes some armor ornaments that are reusable plugs and should appear after the default ones
  ReusablePlugItems = 2, // ReusablePlugItems: 2

  /// Use the ProfilePlugSets (DestinyProfileResponse.profilePlugSets) component data
  /// to determine which plugs are valid for this socket.
  ProfilePlugSet = 4, // ProfilePlugSet: 4

  /// Use the CharacterPlugSets (DestinyProfileResponse.characterPlugSets) component
  /// data to determine which plugs are valid for this socket.
  CharacterPlugSet = 8, // CharacterPlugSet: 8
}

enum IconType {
  Plug = 1,
  TopLevel = 2,
}
// // TODO: Add values, I made these up
// enum ModType {
//   Normal = 1,
//   Artifact = 2,
// }

export type SocketEntry = {
  // extends DestinyItem

  /// This is a bitmask
  iconType: IconType; // default is.Plug
  // modType: ModType; // default is.Normal

  // TODO: The itemHash should not be here. SocketEntries are a type of destinyItem and maybe should be
  // extending that type? But right now it's not been needed.
  itemHash: number;
  plugSources: number; // This is a bitmask

  reusablePlugSocketIndex: number | null;

  plugSourcesAsEnums: SocketPlugSources[];
  plugCreationSource: SocketPlugSources;
  // categoryStyle: CategoryStyle;

  socketIndex: number | null;
  socketTypeHash: number | null;
  singleInitialItemHash: number | null;

  reusablePlugSetHash: number | null;

  /// What plug is socketed if any?
  isVisible: boolean;
  isEnabled: boolean;
  // isActive: boolean;
  // canInsert: boolean;

  /// What is already socketed? This is used to know if this plug is already socketed so it can be dimmed
  // socketedDestinyItemHash: number;

  /// Used so mods can show the gold trim if needed. They need to know if the parent destinyItem is a masterwork
  // destinyItemIsMasterwork: boolean;
  /// Used so mods can show the red border if needed. They need to know if the parent destinyItem is 'resonance completed', since it isn't shown in red border until completed.
  // destinyItemAttunementComplete: boolean;

  /// Used for perk objectives such as forge weapon materials and also kill counters <ObjectiveHash, Amount>
  // plugObjectiveValues: Record<string, number>;

  // TODO: Is this mode needed? It was in Ishtar
  // mode: .SocketEntry

  socketDefinition?: SocketDefinition;
};

export type Sockets = {
  socketCategories: SocketCategory[];
  socketEntries: SocketEntry[];
};

export type SocketCategory = {
  socketCategoryHash: number | null;
  socketIndexes: number[];
  name: string;

  description: string;

  categoryStyle: CategoryStyle;
  index: number;

  // /// This is used to map to a specific socket entry in the itemDefinition
  socketMaps: SocketMap[];

  topLevelSockets: SocketEntry[][];
};

export function createSockets(destinyItem: DestinyItem): Sockets | null {
  const p1 = performance.now();

  // Non instanced items have no sockets.
  if (!destinyItem.itemInstanceId) {
    return null;
  }

  // Create the socket categories and socket entries with the basic info from the itemDefinition
  // It's all been minified to the point where it's unreadable. So at this point we un-minify everything
  // and use the exact same property names as in the original itemDefinition.
  const sockets = unMinifyAndCreateSockets(destinyItem.itemHash);

  if (!sockets) {
    console.error("Failed to create sockets for item", destinyItem.itemHash);
    return null;
  }

  addSocketCategoryDefinition(sockets);

  // TODO: The categories now have an 'index' property gained from the definition. Should this be used
  // to sort the visual order the categories are displayed in?

  updateSocketEntriesWithLiveData(sockets, destinyItem);

  updateSocketCategoriesWithData(sockets, destinyItem);

  addDefinitionsToTopLevelSockets(sockets, destinyItem);

  // TODO: addMasterworkInvestments() should be added. But it presumes addDefinitionsToTopLevelSockets has done
  // it's job and right now some research is needed to see if it's really needed.

  // TODO: addDeepsightResonance() should all be added.
  const p2 = performance.now();
  console.log("createSockets", `${(p2 - p1).toFixed(4)} ms`);
  // console.log("sockets", sockets);
  return sockets;
}

function unMinifyAndCreateSockets(itemHash: number): Sockets | null {
  /// The set of socketCategories an item has can only be discovered from the itemDefinition
  const sk = itemsDefinition[itemHash]?.sk;

  if (!sk || !sk.sc || !sk.se) {
    return null;
  }

  const minifiedSocketCategories = SocketCategories[sk.sc];
  const minifiedSocketEntries = SocketEntries[sk.se];

  if (!minifiedSocketCategories || !minifiedSocketEntries) {
    return null;
  }

  // First create the socket entries as the socket categories will need some data from them.
  const socketEntries: SocketEntry[] = [];
  for (const socketEntry of minifiedSocketEntries) {
    const plugSources = socketEntry.p ?? 0;
    const plugSourcesAsEnums = getBitmaskValues(plugSources);
    let singleInitialItemHash = null;
    if (socketEntry.s) {
      singleInitialItemHash = SingleInitialItemHash[socketEntry.s] ?? null;
    }
    let reusablePlugSetHash = null;
    if (socketEntry.r) {
      reusablePlugSetHash = ReusablePlugSetHash[socketEntry.r] ?? null;
    }
    let socketTypeHash = null;
    if (socketEntry.st) {
      socketTypeHash = SocketTypeHash[socketEntry.st] ?? null;
    }

    const se: SocketEntry = {
      itemHash: 0,
      isVisible: false,
      isEnabled: false,
      iconType: IconType.Plug,
      plugSources,
      plugSourcesAsEnums,
      plugCreationSource: SocketPlugSources.None,
      singleInitialItemHash,
      socketIndex: null,
      reusablePlugSetHash,
      reusablePlugSocketIndex: null,
      socketTypeHash,
    };
    socketEntries.push(se);
  }

  const socketCategories: SocketCategory[] = [];
  for (const socketCategory of minifiedSocketCategories) {
    const socketCategoryHash = SocketCategoryHash[socketCategory.h] ?? null;
    const socketIndexes = SocketIndexes[socketCategory.i];
    if (!socketIndexes || !socketIndexes) {
      console.log("No socketIndexes!! return null");
      return null;
    }

    const socketMaps: SocketMap[] = socketIndexes.map((item) => {
      const socketTypeHash = socketEntries[item]?.socketTypeHash ?? null;
      const sm: SocketMap = {
        socketIndex: item,
        socketTypeHash,
      };
      return sm;
    });
    const sc: SocketCategory = {
      name: "",
      description: "",
      topLevelSockets: [],
      categoryStyle: 0,
      index: -1,
      socketCategoryHash,
      socketIndexes,
      socketMaps,
    };
    socketCategories.push(sc);
  }

  const sockets = {
    socketEntries,
    socketCategories,
  };

  return sockets;
}

function addSocketCategoryDefinition(sockets: Sockets) {
  for (const category of sockets.socketCategories) {
    if (category.socketCategoryHash) {
      const categoryDefinition = DestinySocketCategoryDefinition[category.socketCategoryHash];
      if (categoryDefinition) {
        category.name = categoryDefinition.displayProperties.name;
        category.description = categoryDefinition.displayProperties.description;
        category.categoryStyle = categoryDefinition.categoryStyle;
        category.index = categoryDefinition.index;
      }
    }
  }
}

function updateSocketEntriesWithLiveData(sockets: Sockets, destinyItem: DestinyItem) {
  if (!destinyItem.itemInstanceId) {
    console.error("No itemInstanceId", destinyItem);
    return null;
  }
  const liveSockets = rawProfileData?.Response.itemComponents.sockets.data[destinyItem.itemInstanceId];
  if (!liveSockets) {
    console.error("No liveSockets", destinyItem);
    return null;
  }

  let index = 0;
  for (const s of liveSockets.sockets) {
    const se = sockets.socketEntries[index];
    if (se) {
      se.itemHash = s.plugHash ?? 0;
      se.isVisible = s.isVisible;
      se.isEnabled = s.isEnabled;
    }
    index++;
  }
}

// Populate the sockets with real data. This can do things such as create the weapon perks columns
function updateSocketCategoriesWithData(sockets: Sockets, destinyItem: DestinyItem) {
  if (!destinyItem?.itemInstanceId) {
    console.error("No itemInstanceId", destinyItem);
    return null;
  }
  /// These plugs are used by multiple socketEntries so just grab them once and reuse
  const reusablePlugs = rawProfileData?.Response.itemComponents.reusablePlugs.data[destinyItem.itemInstanceId]?.plugs;

  for (const category of sockets.socketCategories) {
    const categoryStyleEnum = category.categoryStyle;

    for (const map of category.socketMaps) {
      const socket = sockets.socketEntries[map.socketIndex];

      if (!socket?.isVisible) {
        continue;
      }

      switch (categoryStyleEnum) {
        /// for these items the UI itself can decide to get all the plugs. As they are not looked by users
        /// all the time it is a waste to create them for every category
        case CategoryStyle.Consumable:
        case CategoryStyle.EnergyMeter: {
          /// Skip adding the plugs for now
          socket.reusablePlugSocketIndex = map.socketIndex;
          socket.iconType = IconType.TopLevel;
          const entry = [socket];
          category.topLevelSockets.push(entry);
          break;
        }

        default: {
          let plugsFound = false;

          for (const plugSourceEnum of socket.plugSourcesAsEnums) {
            let plugs: PlugSet | null = null;

            switch (plugSourceEnum) {
              case SocketPlugSources.InventorySourced: {
                // TODO: Check if anything is using these. At one point shaders and mods did, but they seem to be in the api now.
                break;
              }
              case SocketPlugSources.ReusablePlugItems: {
                if (reusablePlugs) {
                  plugs = reusablePlugs[map.socketIndex] ?? [];
                }
                break;
              }

              case SocketPlugSources.ProfilePlugSet: {
                if (socket.reusablePlugSetHash) {
                  plugs = rawProfileData?.Response.profilePlugSets.data?.plugs[socket.reusablePlugSetHash] ?? [];
                }
                break;
              }

              case SocketPlugSources.CharacterPlugSet: {
                if (socket.reusablePlugSetHash) {
                  plugs =
                    rawProfileData?.Response.characterPlugSets.data?.[destinyItem.characterId]?.plugs[
                      socket.reusablePlugSetHash
                    ] ?? [];
                }
                break;
              }
              default: {
                console.log("No support for", plugSourceEnum);
              }
            }
            if (plugs && plugs?.length > 0) {
              plugsFound = true;
              category.topLevelSockets = makeSocketEntryColumn(plugs, socket, category.topLevelSockets, plugSourceEnum);
            }
          }
          if (!plugsFound) {
            /// This only happens on armor 1.0 but might happen again in the future.
            /// It ensures a socket with no extra plugs still gets the live socket added
            const socketColumn = [socket];
            category.topLevelSockets.push(socketColumn);
          }
        }
      }
    }
  }
}

function makeSocketEntryColumn(
  plugs: PlugSet,
  socketEntry: SocketEntry,
  topLevelSockets: SocketEntry[][],
  plugCreationSource: SocketPlugSources,
): SocketEntry[][] {
  const topLevelSocketsInternal: SocketEntry[][] = topLevelSockets;

  const socketColumn: SocketEntry[] = [];

  for (const plug of plugs) {
    let socketToAppend: SocketEntry;

    if (plug.plugItemHash) {
      const plugItemHash = plug.plugItemHash;

      if (plugItemHash === socketEntry.itemHash) {
        socketToAppend = socketEntry;
      } else {
        const s: SocketEntry = {
          itemHash: 0,
          iconType: IconType.Plug,
          plugSourcesAsEnums: [],
          plugSources: 0,
          plugCreationSource: SocketPlugSources.None,
          isVisible: false,
          isEnabled: false,
          socketTypeHash: null,
          socketIndex: null,
          singleInitialItemHash: null,
          reusablePlugSetHash: null,
          reusablePlugSocketIndex: null,
        };
        s.itemHash = plugItemHash;
        socketToAppend = s;
      }

      socketToAppend.plugCreationSource = plugCreationSource;
      socketColumn.push(socketToAppend);
    } else {
      console.log("ERROR!! SHOULD NOT HAPPEN", plug);
    }
  }

  if (socketColumn.length > 0) {
    topLevelSocketsInternal.push(socketColumn);
  }

  return topLevelSocketsInternal;
}

function addDefinitionsToTopLevelSockets(sockets: Sockets, _destinyItem: DestinyItem) {
  for (const category of sockets.socketCategories) {
    let columnIndex = 0;

    for (const column of category.topLevelSockets) {
      for (const socketEntry of column) {
        addSocketDefinition(socketEntry);

        /// Add the data needed for inserting a free plug
        socketEntry.socketTypeHash = category.socketMaps[columnIndex]?.socketTypeHash ?? null;
        socketEntry.socketIndex = category.socketMaps[columnIndex]?.socketIndex ?? null;

        // TODO: add back when this extends destinyItem?
        // socketEntry.itemInstanceId = destinyItem.itemInstanceId

        // let characterIdArg = "";

        // if (destinyItem.characterId === VAULT_CHARACTER_ID) {
        //   characterIdArg = useGGStore.getState().ggCharacters[0]?.characterId ?? "";
        // } else {
        //   characterIdArg = destinyItem.characterId;
        // }
        // TODO: add back when this extends destinyItem?

        // socketEntry.characterId = characterIdArg
      }

      columnIndex++;
    }
  }
}

function addSocketDefinition(socket: SocketEntry) {
  const itemDefinition = itemsDefinition[socket.itemHash];
  if (!itemDefinition) {
    return null;
  }

  const name = itemDefinition.n ?? "";
  let description = "";
  const descriptionIndex = itemDefinition.d;
  if (descriptionIndex) {
    description = Descriptions[descriptionIndex] ?? "";
  }
  let icon = "";
  const iconIndex = itemDefinition.i;
  if (iconIndex) {
    const iconPath = Icons[iconIndex];
    if (iconPath) {
      icon = `${iconUrl}${iconPath}`;
    }
  }
  const itemType = itemDefinition.it ?? 0;
  const tierType = itemDefinition.t ?? 0;
  let itemTypeDisplayName = "";
  const itdIndex = itemDefinition.itd;
  if (itdIndex) {
    itemTypeDisplayName = ItemTypeDisplayName[itdIndex] ?? "";
  }
  let uiItemDisplayStyle = "";
  const itemDefinitionIdex = itemDefinition.ids;
  if (itemDefinitionIdex) {
    uiItemDisplayStyle = ItemTypeDisplayName[itemDefinitionIdex] ?? "";
  }
  const investmentStats: StatsCollection[] = [];
  const investments = itemDefinition.iv;
  if (investments) {
    for (const iv of Object.keys(investments)) {
      const statTypeHash = Number(StatHash[Number(iv)]);
      const value = investments[iv] ?? 0;
      investmentStats.push({ statTypeHash, value });
    }
  }

  const socketDefinition: SocketDefinition = {
    name,
    description,
    icon,
    itemType,
    tierType,
    itemTypeDisplayName,
    uiItemDisplayStyle,
    investmentStats,
  };

  socket.socketDefinition = socketDefinition;
}
