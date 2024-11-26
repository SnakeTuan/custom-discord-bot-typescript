import { getValorantVersion } from "./version";
import { asyncReadJSONFile } from "@/utils/json";

const formatVersion = 14;
let gameVersion: string;
let weapons: string,
  skins: string,
  rarities: string,
  buddies: string,
  sprays: string,
  cards: string,
  titles: string,
  bundles: string,
  battlepass: string;
let prices = { timestamp: null };

export const loadSkinsJSON = async (filename = "val-data/skins.json") => {
  const jsonData = await asyncReadJSONFile(filename).catch(() => {});
  if (!jsonData || jsonData.formatVersion !== formatVersion) return;

  weapons = jsonData.weapons;
  skins = jsonData.skins;
  prices = jsonData.prices;
  rarities = jsonData.rarities;
  bundles = jsonData.bundles;
  buddies = jsonData.buddies;
  sprays = jsonData.sprays;
  cards = jsonData.cards;
  titles = jsonData.titles;
  battlepass = jsonData.battlepass;
};
