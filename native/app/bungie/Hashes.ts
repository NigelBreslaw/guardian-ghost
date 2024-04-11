// static property Dictionary<String, Inventory.Section> bucketToEnum: [
//     "1345459588" : .Pursuits ,
//     "2465295065" : .EnergyWeapons, //2465295065
//     "2689798304" : .UpgradePoint, //
//     "2689798305" : .StrangeCoin, //
//     "2689798308" : .Glimmer, //
//     "2689798309" : .LegendaryShards, //
//     "2689798310" : .Silver, //
//     "2689798311" : .BrightDust, //
//     "2973005342" : .Shaders1, //
//     "3054419239" : .Emotes, //
//     "3161908920" : .Messages, //
//     "3284755031" : .Subclass, //
//     "3313201758" : .Modifications, //
//     "3448274439" : .Helmet, //
//     "3551918588" : .Gauntlets, // undefined //3621873013 undefined 3796357825
//     "3865314626" : .Materials, //
//     "4023194814" : .Ghost, //
//     "4274335291" : .Emblems, //
//     "4292445962" : .ClanBanners, //
//     "14239492" : .ChestArmor, //
//     "18606351" : .Shaders2, //
//     "20886954" : .LegArmor, //
//     "138197802" : .General, //
//     "215593132" : .LostItems, //
//     "284967655" : .Ships, //
//     "375726501" : .Engrams, // undefined 444348033 undefined 497170007
//     "953998645" : .PowerWeapons, //
//     "1269569095" : .Auras, //
//     "1367666825" : .SpecialOrders, //
//     "1469714392" : .Consumables, //
//     "1498876634" : .KineticWeapons, //
//     "1585787867" : .ClassArmor, // undefined //1626737477 undefined //1801258597
//     "2025709351" : .Vehicle, //
//     "1506418338" : .Artifact,
//     "3683254069" : .Finisher
// ]

export const characterBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  3448274439, // helmet
  3551918588, // guantlets
  14239492, // chest armor
  20886954, // leg armor
  1585787867, // class armor
  4023194814, // ghost
  2025709351, // vehicle
  284967655, // ships
  3284755031, // subclass
  4292445962, // banners
  4274335291, // emblems
  3683254069, // finisher
  1107761855, // emotes
  1506418338, // artifact
];

export enum GuardianClassType {
  Titan = 0,
  Hunter = 1,
  Warlock = 2,
  Unknown = 3,
  Vault = 100,
}

export enum DestinyClass {
  Titan = 0,
  Hunter = 1,
  Warlock = 2,
  Unknown = 3,
}

export enum GuardianGenderType {
  Male = 0,
  Female = 1,
  Unknown = 2,
}

export enum GuardianRaceType {
  Human = 0,
  Awoken = 1,
  Exo = 2,
  Unknown = 3,
}
