import { CommandInteraction } from "discord.js";
import { fetchShop } from "@/shop/fetch-daily-shop";

export const shop = {
  name: "shop",
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();

    const shopResult = await fetchShop(interaction);
    console.log("shopResult: ", shopResult);

    if (shopResult.success) {
      await interaction.followUp("fetching shop completed!");
    } else {
      await interaction.followUp("You might need to login first");
    }
  },
};
