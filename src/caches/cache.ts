import { getValorantVersion } from "./version";
import { asyncReadJSONFile } from "@/utils/handle-file";
import { getUser, getUserList } from "../utils/val-user";
import config from "../utils/val-config";
import fs from "fs";

const formatVersion = 14;
let gameVersion: any;
let weapons: any, skins: any, rarities: any, buddies: any, sprays: any, cards: any, titles: any, bundles: any, battlepass: any;
let prices = { timestamp: null };

export const loadSkinsJSON = async (filename = "@/val-data/skins.json") => {
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

export const saveSkinsJSON = (filename = "@/val-data/skins.json") => {
  fs.writeFileSync(
    filename,
    JSON.stringify(
      {
        formatVersion,
        gameVersion,
        weapons,
        skins,
        prices,
        bundles,
        rarities,
        buddies,
        sprays,
        cards,
        titles,
        battlepass,
      },
      null,
      2
    )
  );
};

export const getSkinList = async (gameVersion: string) => {
  console.log("Fetching valorant skin list...");

  const req = await fetch("https://valorant-api.com/v1/weapons?language=all");
  console.assert(req.status === 200, `Valorant skins status code is ${req.status}!`, req);

  const bodyText = await req.text();
  const json = JSON.parse(bodyText);
  console.assert(json.status === 200, `Valorant skins data status code is ${json.status}!`, json);

  skins = { version: gameVersion };
  weapons = {};
  for (const weapon of json.data) {
    weapons[weapon.uuid] = {
      uuid: weapon.uuid,
      names: weapon.displayName,
      icon: weapon.displayIcon,
      defaultSkinUuid: weapon.defaultSkinUuid,
    };
    for (const skin of weapon.skins) {
      const levelOne = skin.levels[0];

      let icon;
      if (skin.themeUuid === "5a629df4-4765-0214-bd40-fbb96542941f") {
        // default skins
        icon = skin.chromas[0] && skin.chromas[0].fullRender;
      } else {
        for (let i = 0; i < skin.levels.length; i++) {
          if (skin.levels[i] && skin.levels[i].displayIcon) {
            icon = skin.levels[i].displayIcon;
            break;
          }
        }
      }
      if (!icon) icon = null;
      skins[levelOne.uuid] = {
        uuid: levelOne.uuid,
        skinUuid: skin.uuid,
        weapon: weapon.uuid,
        names: skin.displayName,
        icon: icon,
        rarity: skin.contentTierUuid,
        defaultSkinUuid: weapon.defaultSkinUuid,
        levels: skin.levels,
        chromas: skin.chromas,
      };
    }
  }

  saveSkinsJSON();
  return json;
};
// for test the getSkinList function:
// const initialize = async () => {
//   gameVersion = (await getValorantVersion()).manifestId;
//   getSkinList(gameVersion)
//     .then((skinList) => {
//       console.log("Skin List:", skinList);
//     })
//     .catch((error) => {
//       console.error("Error fetching skin list:", error);
//     });
// };
// initialize();
