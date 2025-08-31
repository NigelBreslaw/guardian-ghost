import type { DestinyItem, DestinyItemDefinition } from "@/app/inventory/logic/Types.ts";
import type { ItemHash, PlugSet } from "@/app/core/GetProfile.ts";
import { Helpers, DestinyDefinitions, ProfileDataHelpers } from "@/app/store/Definitions.ts";
import { getBitmaskValues } from "@/app/utilities/Helpers.ts";
import { getItemDefinition } from "@/app/store/Account/AccountSlice";

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

export type SocketEntry = {
  /// This is a bitmask
  iconType: IconType; // default is.Plug

  // extending that type? But right now it's not been needed.
  itemHash: ItemHash;
  plugSources: number; // This is a bitmask

  reusablePlugSocketIndex: number | null;

  plugSourcesAsEnums: SocketPlugSources[];
  plugCreationSource: SocketPlugSources;

  socketIndex: number | null;
  socketTypeHash: number | null;
  singleInitialItemHash: ItemHash | null;

  reusablePlugSetHash: number | null;
  randomizedPlugSetHash: number | null;

  // What plug is socketed if any?
  isVisible: boolean;
  isEnabled: boolean;
  // What is already socketed? This is used to know if this plug is already socketed so it can be dimmed
  // socketedDestinyItemHash: number;

  /// Used so mods can show the gold trim if needed. They need to know if the parent destinyItem is a masterwork
  // destinyItemIsMasterwork: boolean;
  /// Used so mods can show the red border if needed. They need to know if the parent destinyItem is 'resonance completed', since it isn't shown in red border until completed.
  // destinyItemAttunementComplete: boolean;

  /// Used for perk objectives such as forge weapon materials and also kill counters <ObjectiveHash, Amount>
  // plugObjectiveValues: Record<string, number>;
  def?: DestinyItemDefinition;
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
  // Non instanced items have no sockets.
  if (!destinyItem.itemInstanceId) {
    return null;
  }

  // Create the socket categories and socket entries with the basic info from the itemDefinition
  // It's all been minified to the point where it's unreadable. So at this point we un-minify everything
  // and use the exact same property names as in the original itemDefinition.
  const sockets = expandAndCreateSockets(destinyItem.itemHash);

  if (!sockets) {
    return null;
  }

  updateSocketEntriesWithLiveData(sockets, destinyItem);

  updateSocketCategoriesWithData(sockets, destinyItem);

  addDefinitionsToTopLevelSockets(sockets, destinyItem);

  return sockets;
}

const ExpandedSocketsCache = new Map<number, Sockets>();

export function expandAndCreateSockets(itemHash: ItemHash): Sockets | null {
  if (ExpandedSocketsCache.has(itemHash)) {
    const sockets = ExpandedSocketsCache.get(itemHash)!;
    // Deep clone the object to prevent mutation
    const socketCopy = JSON.parse(JSON.stringify(sockets)) as Sockets;
    return socketCopy;
  }
  /// The set of socketCategories an item has can only be discovered from the itemDefinition
  const sk = DestinyDefinitions.itemsDefinition[itemHash]?.sk;

  if (!sk || !sk.sc || !sk.se) {
    return null;
  }

  const minifiedSocketCategories = Helpers.SocketCategories[sk.sc];
  const minifiedSocketEntries = Helpers.SocketEntries[sk.se];

  if (!minifiedSocketCategories || !minifiedSocketEntries) {
    return null;
  }

  // First create the socket entries as the socket categories will need some data from them.
  const socketEntries: SocketEntry[] = [];
  for (const socketEntry of minifiedSocketEntries) {
    const plugSources = socketEntry.p ?? 0;
    const plugSourcesAsEnums = getBitmaskValues(plugSources);
    if (plugSourcesAsEnums.length === 0) {
      plugSourcesAsEnums.push(SocketPlugSources.None);
    }
    let singleInitialItemHash = null;
    if (socketEntry.s) {
      singleInitialItemHash = (Helpers.SingleInitialItemHash[socketEntry.s] ?? null) as ItemHash | null;
    }
    let randomizedPlugSetHash = null;
    if (socketEntry.ra) {
      randomizedPlugSetHash = Helpers.RandomizedPlugSetHash[socketEntry.ra] ?? null;
    }
    let reusablePlugSetHash = null;
    if (socketEntry.r) {
      reusablePlugSetHash = Helpers.ReusablePlugSetHash[socketEntry.r] ?? null;
    }
    let socketTypeHash = null;
    if (socketEntry.st) {
      socketTypeHash = Helpers.SocketTypeHash[socketEntry.st] ?? null;
    }

    const se: SocketEntry = {
      itemHash: 0 as ItemHash,
      isVisible: false,
      isEnabled: false,
      iconType: IconType.Plug,
      plugSources,
      plugSourcesAsEnums,
      plugCreationSource: SocketPlugSources.None,
      singleInitialItemHash,
      socketIndex: null,
      reusablePlugSetHash,
      randomizedPlugSetHash,
      reusablePlugSocketIndex: null,
      socketTypeHash,
    };
    socketEntries.push(se);
  }

  const socketCategories: SocketCategory[] = [];
  for (const socketCategory of minifiedSocketCategories) {
    const socketCategoryHash = Helpers.SocketCategoryHash[socketCategory.h] ?? null;
    const socketIndexes = Helpers.SocketIndexes[socketCategory.i];
    if (!socketIndexes) {
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

  addSocketCategoryDefinition(sockets);

  ExpandedSocketsCache.set(itemHash, sockets);
  // Deep clone the object to prevent mutation
  const socketCopy = JSON.parse(JSON.stringify(sockets)) as Sockets;
  return socketCopy;
}

function addSocketCategoryDefinition(sockets: Sockets) {
  for (const category of sockets.socketCategories) {
    if (category.socketCategoryHash) {
      const categoryDefinition = DestinyDefinitions.socketCategory?.[category.socketCategoryHash];
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
  const liveSockets = ProfileDataHelpers.rawProfile?.Response.itemComponents?.sockets.data[destinyItem.itemInstanceId];
  if (!liveSockets) {
    console.error("No liveSockets", destinyItem);
    return null;
  }

  liveSockets.sockets.forEach((socket, index) => {
    const se = sockets.socketEntries[index];
    if (se) {
      se.itemHash = (socket.plugHash ?? 0) as ItemHash;
      se.isVisible = socket.isVisible;
      se.isEnabled = socket.isEnabled;
    }
  });
}

// Populate the sockets with real data. This can do things such as create the weapon perks columns
function updateSocketCategoriesWithData(sockets: Sockets, destinyItem: DestinyItem) {
  if (!destinyItem?.itemInstanceId) {
    console.error("No itemInstanceId", destinyItem);
    return null;
  }
  /// These plugs are used by multiple socketEntries so just grab them once and reuse
  const reusablePlugs =
    ProfileDataHelpers.rawProfile?.Response.itemComponents?.reusablePlugs.data[destinyItem.itemInstanceId]?.plugs;

  for (const category of sockets.socketCategories) {
    const categoryStyleEnum = category.categoryStyle;

    for (const map of category.socketMaps) {
      const socket = sockets.socketEntries[map.socketIndex];

      if (!socket) {
        continue;
      }

      switch (categoryStyleEnum) {
        /// for these items the UI itself can decide to get all the plugs. As they are not looked by users
        /// all the time it is a waste to create them for every category
        case CategoryStyle.Consumable:
        case CategoryStyle.LargePerk:
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
              case SocketPlugSources.None: {
                if (reusablePlugs) {
                  plugs = reusablePlugs[map.socketIndex] ?? [];
                }
                break;
              }
              case SocketPlugSources.InventorySourced: {
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
                  plugs =
                    ProfileDataHelpers.rawProfile?.Response.profilePlugSets?.data?.plugs[socket.reusablePlugSetHash] ??
                    [];
                }
                break;
              }

              case SocketPlugSources.CharacterPlugSet: {
                if (socket.reusablePlugSetHash) {
                  plugs =
                    ProfileDataHelpers.rawProfile?.Response.characterPlugSets.data?.[destinyItem.characterId]?.plugs[
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
          itemHash: 0 as ItemHash,
          iconType: IconType.Plug,
          plugSourcesAsEnums: [],
          plugSources: 0,
          plugCreationSource: SocketPlugSources.None,
          isVisible: false,
          isEnabled: false,
          socketTypeHash: null,
          socketIndex: null,
          singleInitialItemHash: null,
          randomizedPlugSetHash: null,
          reusablePlugSetHash: null,
          reusablePlugSocketIndex: null,
        };
        s.itemHash = plugItemHash as ItemHash;
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
    category.topLevelSockets.forEach((column, columnIndex) => {
      for (const socketEntry of column) {
        socketEntry.def = getItemDefinition(socketEntry.itemHash);
        socketEntry.socketTypeHash = category.socketMaps[columnIndex]?.socketTypeHash ?? null;
        socketEntry.socketIndex = category.socketMaps[columnIndex]?.socketIndex ?? null;
      }
    });
  }
}
