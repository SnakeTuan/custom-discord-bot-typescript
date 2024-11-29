import { getValorantVersion } from "./version";
import { asyncReadJSONFile } from "../utils/json";
import { getUser, getUserList } from "../utils/val-user";
import { authUser } from "../utils/val-auth";
import config from "../utils/val-config";
import fs from "fs";

const formatVersion = 14;
let gameVersion: any;
let weapons: any,
  skins: any,
  rarities: any,
  buddies: any,
  sprays: any,
  cards: any,
  titles: any,
  bundles: any,
  battlepass: any;
let prices = { timestamp: null };

export const loadSkinsJSON = async (filename = "../val-data/skins.json") => {
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

export const saveSkinsJSON = (filename = "../val-data/skins.json") => {
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
  console.assert(
    req.status === 200,
    `Valorant skins status code is ${req.status}!`,
    req
  );

  const bodyText = await req.text();
  const json = JSON.parse(bodyText);
  console.assert(
    json.status === 200,
    `Valorant skins data status code is ${json.status}!`,
    json
  );

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

const getPrices = async (gameVersion: string, id: string | null = null) => {
  if (!config.fetchSkinPrices) return;

  // if no ID is passed, try with all users
  if (id === null) {
    for (const id of getUserList()) {
      const user = getUser(id);
      if (!user || !user.auth) {
        continue;
      }
      const success = await getPrices(gameVersion, id);
      if (success) {
        return true;
      }
    }
    return false;
  }

  // if ID is passed, try with that user
  let user = getUser(id);
  if (!user) return false;

  const authSuccess = await authUser(id);
  if (!authSuccess.success || !user.auth.rso || !user.auth.ent || !user.region)
    return false;

  user = getUser(id);
  console.log(`Fetching skin prices using ${user.username}'s access token...`);

  // https://github.com/techchrism/valorant-api-docs/blob/trunk/docs/Store/GET%20Store_GetOffers.md
  const req = await fetch(
    `https://pd.${userRegion(user)}.a.pvp.net/store/v1/offers/`,
    {
      headers: {
        Authorization: "Bearer " + user.auth.rso,
        "X-Riot-Entitlements-JWT": user.auth.ent,
        ...riotClientHeaders(),
      },
    }
  );
  console.assert(
    req.statusCode === 200,
    `Valorant skins prices code is ${req.statusCode}!`,
    req
  );

  const json = JSON.parse(req.body);
  if (json.httpStatus === 400 && json.errorCode === "BAD_CLAIMS") {
    return false; // user rso is invalid, should we delete the user as well?
  } else if (isMaintenance(json)) return false;

  prices = { version: gameVersion };
  for (const offer of json.Offers) {
    prices[offer.OfferID] = offer.Cost[Object.keys(offer.Cost)[0]];
  }

  prices.timestamp = Date.now();

  saveSkinsJSON();

  return true;
};
