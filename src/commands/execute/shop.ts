import { CommandInteraction, EmbedBuilder } from "discord.js";
import { fetchShop } from "@/shop/fetch-daily-shop";
import { getUser } from "@/utils/val-user";
import { getShopCache } from "@/caches/shop-cache";
import { loadSkinsList } from "@/caches/save-skin";
import messages from "@/collections/messages";
import { embedShopMessage } from "@/shop/embed-shop-message";

export const shop = {
  name: "shop",
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();

    const user = getUser(interaction.user.id);
    let shop = null;

    shop = getShopCache(user.puuid);
    if (!shop) {
      shop = await fetchShop(interaction);
    }

    console.log("shopResult: ", shop);

    try {
      const skinIds = shop.offers.offers.slice(0, 4); // Get the first 4 offers

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
