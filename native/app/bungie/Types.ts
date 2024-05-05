import type {
  DestinyClass,
  GuardianClassType,
  GuardianGenderType,
  GuardianRaceType,
  ItemType,
  DamageType,
} from "@/app/bungie/Common.ts";
import type { DestinyItemBase, GuardianData } from "@/app/core/GetProfile.ts";
import { number, object, string } from "valibot";
import type { Output } from "valibot";

export enum TierType {
  Unknown = 0,
  Currency = 1,
  Uncommon = 2,
  Common = 3,
  Rare = 4,
  Legendary = 5,
  Exotic = 6,
}

export enum ItemSubType {
  None = 0,
  Crucible = 1,
  Vanguard = 2,
  Exotic = 5,
  AutoRifle = 6,
  Shotgun = 7,
  MachineGun = 8,
  HandCannon = 9,
  RocketLauncher = 10,
  FusionRifle = 11,
  SniperRifle = 12,
  PulseRifle = 13,
  ScoutRifle = 14,
  Crm = 16,
  Sidearm = 17,
  Sword = 18,
  Mask = 19,
  Shader = 20,
  Ornament = 21,
  FusionRifleLine = 22,
  GrenadeLauncher = 23,
  SubmachineGun = 24,
  TraceRifle = 25,
  HelmetArmor = 26,
  GauntletsArmor = 27,
  ChestArmor = 28,
  LegArmor = 29,
  ClassArmor = 30,
  Bow = 31,
  DummyRepeatableBounty = 32,
  Glaive = 33,
}

export type GuardiansAndVault = {
  vault: VaultData;
  guardians: Record<string, Guardian>;
};

export type Guardian = {
  data: GuardianData;
  items: Record<number, GuardianGear>;
};

export type GuardianGear = {
  equipped: DestinyItem | null;
  inventory: DestinyItem[];
};

export type VaultData = {
  generalVault: Record<number, DestinyItem[]>;
  consumables: DestinyItem[];
  mods: DestinyItem[];
  lostItems: DestinyItem[];
};

export const BungieUserSchema = object({
  supplementalDisplayName: string(),
  iconPath: string(),
  topLevelAccountMembershipId: string(),
  profile: object({
    membershipId: string(),
    membershipType: number(),
    displayName: string(),
  }),
});

export type BungieUser = Output<typeof BungieUserSchema>;

export type DestinyItemDefinition = {
  characterId: string;
  equipped: boolean;
  previousCharacterId: string; //Used by the transfer system to update the UI
  recoveryBucketHash: number;
  itemType: ItemType;
  masterwork?: boolean;
  primaryStat: number;
  icon: string;
  calculatedWaterMark?: string;
  damageType?: DamageType;
  deepSightResonance?: boolean;
  crafted?: boolean;
  itemSubType: ItemSubType;
  tierType: TierType;
  destinyClass: DestinyClass;
  doesPostmasterPullHaveSideEffects: boolean;
  maxStackSize: number;
  stackUniqueLabel?: string;
  nonTransferrable: boolean;
  equippable: boolean;
  plugCategoryIdentifier?: string;
};

export type DestinyItem = DestinyItemBase & DestinyItemDefinition;

export type DestinyItemSort = DestinyItem & {
  itemInstanceId: string;
  damageType: DamageType;
  plugCategoryIdentifier: string;
};

export enum GGCharacterType {
  Guardian = 0,
  Vault = 1,
}

export type GGCharacterUiData = {
  characterId: string;
  guardianClassType: GuardianClassType;
  genderType: GuardianGenderType;
  raceType: GuardianRaceType;
  emblemPath: string;
  emblemBackgroundPath: string;
  secondarySpecial: string;
  lastActiveCharacter: boolean;
  ggCharacterType: GGCharacterType;
};
