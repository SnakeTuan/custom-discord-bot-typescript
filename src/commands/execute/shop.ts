import { CommandInteraction, EmbedBuilder } from "discord.js";
import { fetchShop } from "@/shop/fetch-daily-shop";
import { getUser } from "@/utils/val-user";
import { getShopCache } from "@/caches/shop-cache";
import { loadSkinsList } from "@/caches/save-skin";
import messages from "@/collections/messages";
import { embedShopMessage } from "@/shop/embed-shop-message";
import { gameVersion } from "@/index";

export const shop = {
  name: "shop",
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();

    const user = getUser(interaction.user.id);

    if (!user) {
      await interaction.followUp("You haven't logged in yet.");
      return;
    }

    let shop = null;

    try {
      shop = getShopCache(user.puuid);
      if (!shop) {
        shop = await fetchShop(interaction);
        if (!shop) {
          console.error("Error fetching shop");
          await interaction.followUp("No current shop offers available.");
        }
        shop = getShopCache(user.puuid);
      }

      console.log("shopResult: ", shop);

      const skinIds = shop.offers.daily_offers.slice(0, 4); // Get the first 4 offers

      console.log("skinIds: ", skinIds);
      const skinsData = await loadSkinsList();

      if (!skinsData) {
        await interaction.followUp("Failed to load skins data.");
        return;
      }

      const embed = embedShopMessage(interaction, user, shop, skinsData);
      await interaction.followUp({
        embeds: embed,
      });
    } catch (e) {
      console.error("Error fetching shop: ", e);
      await interaction.followUp("No current shop offers available.");
    }
  },
};
