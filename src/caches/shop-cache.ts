export let NMTimestamp: any | null = null;
import fs from "fs";
import { discordTag } from "@/index";

/** Shop cache format:
 * {
 *     offers: {
 *         offers: [...],
 *         expires: timestamp,
 *         accessory: {
 *              offers: [{
 *                  "cost": 4000,
 *                  "rewards": [{
 *                      "ItemTypeID": uuid,
 *                      "ItemID": uuid,
 *                      "Quantity": number
 *                      }],
 *                  "contractID": uuid
 *                  },...],
 *              expires: timestamp
 *          }
 *     },
 *     bundles: [{
 *         uuid: uuid,
 *         expires: timestamp
 *     }, {...}],
 *     night_market?: {
 *         offers: [{
 *             uuid: uuid,
 *             realPrice: 5000,
 *             nmPrice: 1000,
 *             percent: 80
 *         }, {...}],
 *         expires: timestamp
 *     },
 *     timestamp: timestamp
 * }
 */

export const addShopCache = (puuid: any, shopJson: any) => {
  const now = Date.now();
  console.log("Creating shop cache.....");
  const shopCache = {
    offers: {
      offers: shopJson.SkinsPanelLayout.SingleItemOffers,
      expires: Math.floor(now / 1000) + shopJson.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds,
      accessory: {
        offers: (shopJson.AccessoryStore.AccessoryStoreOffers || []).map((rawAccessory: any) => {
          return {
            cost: rawAccessory.Offer.Cost["85ca954a-41f2-ce94-9b45-8ca3dd39a00d"],
            rewards: rawAccessory.Offer.Rewards,
            contractID: rawAccessory.ContractID,
          };
        }),
        expires: Math.floor(now / 1000) + shopJson.AccessoryStore.AccessoryStoreRemainingDurationInSeconds,
      },
    },
    bundles: shopJson.FeaturedBundle.Bundles.map((rawBundle: any) => {
      return {
        uuid: rawBundle.DataAssetID,
        expires: Math.floor(now / 1000) + rawBundle.DurationRemainingInSeconds,
      };
    }),
    night_market: formatNightMarket(shopJson.BonusStore),
    timestamp: now,
  };

  console.log("Shop cache data: ", shopCache);

  if (shopJson.BonusStore) {
    console.log("Detected night market...");
    NMTimestamp = now;
  }

  try {
    console.log("Saving shop cache.....");
    if (!fs.existsSync("val-data/shopCache")) {
      fs.mkdirSync("val-data/shopCache");
    }
    fs.writeFileSync("val-data/shopCache/" + puuid + ".json", JSON.stringify(shopCache, null, 2));
  } catch (e) {
    console.log("error while writing shop cache: ", e);
  }

  console.log(`Added shop cache for user ${discordTag(puuid)}`);
};

export const formatNightMarket = (rawNightMarket: any) => {
  if (!rawNightMarket) return null;

  return {
    offers: rawNightMarket.BonusStoreOffers.map((offer: any) => {
      return {
        uuid: offer.Offer.OfferID,
        realPrice: offer.Offer.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"],
        nmPrice: offer.DiscountCosts["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"],
        percent: offer.DiscountPercent,
      };
    }),
    expires: Math.floor(Date.now() / 1000) + rawNightMarket.BonusStoreRemainingDurationInSeconds,
  };
};
