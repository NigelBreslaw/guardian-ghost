import {
  ReusablePlugSetHash,
  SingleInitialItemHash,
  SocketCategories,
  SocketCategoryHash,
  SocketEntries,
  SocketIndexes,
  SocketTypeHash,
  itemsDefinition,
} from "@/app/store/Definitions.ts";

// enum CategoryStyle {
//   Unknown = 0,
//   Reusable = 1,
//   Consumable = 2,
//   Unlockable = 3,
//   Intrinsic = 4,
//   EnergyMeter = 5,
//   LargePerk = 6,
//   Abilities = 7,
//   Supers = 8,
// }

// type SocketMap = {
//   socketIndex: number;
//   socketTypeHash: number;
// };

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

// TODO: Add values, I made these up
// enum IconType {
//   TopLevel = 1,
//   Plug = 2,
// }
// // TODO: Add values, I made these up
// enum ModType {
//   Normal = 1,
//   Artifact = 2,
// }

type SocketEntry = {
  // extends DestinyItem

  /// This is a bitmask
  // iconType: IconType; // default is.Plug
  // modType: ModType; // default is.Normal
  plugSources?: SocketPlugSources;
  // reusablePlugSocketIndex: number;

  // plugSourceEnums: SocketPlugSources[];
  // plugCreationSource: SocketPlugSources;
  // categoryStyle: CategoryStyle;

  // socketIndex: number;
  socketTypeHash?: number;
  singleInitialItemHash?: number;

  reusablePlugSetHash?: number;

  /// What plug is socketed if any?
  // isVisible: boolean;
  // isEnabled: boolean;
  // isActive: boolean;
  // canInsert: boolean;

  /// What is already socketed? This is used to know if this plug is already socketed so it can be dimmed
  // socketedDestinyItemHash: number;

  /// Used so mods can show the gold trim if needed. They need to know if the parent destinyItem is a masterwork
  // destinyItemIsMasterwork: boolean;
  /// Used so mods can show the red border if needed. They need to know if the parent destinyItem is 'resonance completed', since it isn't shown in red border until completed.
  // destinyItemAttunementComplete: boolean;

  /// Used for perk objectives such as forgable weapon materials and also kill counters <ObjectiveHash, Amount>
  // plugObjectiveValues: Record<string, number>;

  // TODO: Is this mode needed? It was in Ishtar
  // mode: .SocketEntry
};

type Sockets = {
  socketCategories: SocketCategory[];
  socketEntries: SocketEntry[];
};

type SocketCategory = {
  socketCategoryHash?: number;
  socketIndexes?: number[];
  // name: string;
  // description: string;

  // categoryStyle: CategoryStyle;
  // index: number;

  // /// This is used to map to a specific socket entry in the itemDefinition
  // socketMap: SocketMap[];

  // topLevelSockets: SocketEntry[][];
};

export function createSockets(itemHash: number): Sockets | null {
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

  // First create the socket categories and socket entries with the basic info from the itemDefinition
  // It's all been minified to the point where it's unreadable. So at this point we un-minify everything
  // and use the exact same property names as in the original itemDefinition.
  const socketCategories: SocketCategory[] = [];
  for (const socketCategory of minifiedSocketCategories) {
    const socketCategoryHash = SocketCategoryHash[socketCategory.h];
    const socketIndexes = SocketIndexes[socketCategory.i];
    if (!socketIndexes || !socketIndexes) {
      console.log("No socketIndexes!! return null");
      return null;
    }
    const sc = { socketCategoryHash, socketIndexes };
    socketCategories.push(sc);
  }

  const socketEntries = [];
  for (const socketEntry of minifiedSocketEntries) {
    const plugSources = socketEntry.p;
    let singleInitialItemHash = undefined;
    if (socketEntry.s) {
      singleInitialItemHash = SingleInitialItemHash[socketEntry.s];
    }
    let reusablePlugSetHash = undefined;
    if (socketEntry.r) {
      reusablePlugSetHash = ReusablePlugSetHash[socketEntry.r];
    }
    let socketTypeHash = undefined;
    if (socketEntry.st) {
      socketTypeHash = SocketTypeHash[socketEntry.st];
    }

    const se = {
      plugSources,
      singleInitialItemHash,
      reusablePlugSetHash,
      socketTypeHash,
    };
    socketEntries.push(se);
  }

  const sockets = {
    socketEntries,
    socketCategories,
  };

  return sockets;
}
