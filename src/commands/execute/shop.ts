import { CommandInteraction, EmbedBuilder } from "discord.js";
import { fetchShop } from "@/shop/fetch-daily-shop";
import { getUser } from "@/utils/val-user";
import { getShopCache } from "@/caches/shop-cache";
import { loadSkinsList } from "@/caches/save-skin";
import messages from "@/collections/messages";

let colorMap = {
  "0cebb8be-46d7-c12a-d306-e9907bfc5a25": 0x009984,
  "e046854e-406c-37f4-6607-19a9ba8426fc": 0xf99358,
  "60bca009-4182-7998-dee7-b8a2558dc369": 0xd1538c,
  "12683d76-48d7-84a3-4e09-6985794f0445": 0x5a9fe1,
  "411e4a55-4e59-7757-41f0-86a53f101bb5": 0xf9d563,
};

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

    if (shop.offers && shop.offers.offers.length > 0) {
      const skinIds = shop.offers.offers.slice(0, 4); // Get the first 4 offers

      console.log("skinIds: ", skinIds);
      const skinsData = await loadSkinsList();

      if (!skinsData) {
        await interaction.followUp("Failed to load skins data.");
        return;
      }
      console.log(skinsData["weapons"]["eb26c879-4a83-86ad-74a5-4db9fd6b3983"]);
      // let message = null;
      // for (let i = 0; i < skinIds.length; i++) {
      //   const weapon = skinsData.weapons[skinIds[i] as string];
      //   if (!weapon) {
      //     console.warn(`Weapon with ID ${skinIds[i]} not found in skinsData.weapons.`);
      //     message = {
      //       id: skinIds[i],
      //       name: "Unknown",
      //       image: "N/A",
      //     };
      //   } else {
      //     message = {
      //       id: skinIds[i],
      //       name: weapon.names["es-ES"],
      //       image: weapon.icon,
      //     };
      //   }
      //   console.log("message: ", message);
      // }
      const skinDetails = skinIds.map((skinId: string) => {
        console.log("skinId: ", skinId);
        const skin = skinsData.skins[skinId];
        if (!skin) {
          console.warn(`Weapon with ID ${skinId} not found in skinsData.skins`);
          return {
            id: skinId,
            name: "Unknown",
            image: "N/A",
          };
        }
        return {
          id: skinId,
          name: skin.names["es-ES"],
          image: skin.icon,
        };
      });

      // Create Discord embed message
      const embed = new EmbedBuilder().setTitle("Daily Shop Offers").setColor("#0099ff").setTimestamp();

      skinDetails.forEach((skin: any, index: number) => {
        embed.addFields([
          { name: `Offer ${index + 1}`, value: `**ID:** ${skin.id}\n**Name:** ${skin.name}\n**Image:** ${skin.image}`, inline: true },
        ]);
      });

      await interaction.followUp({ embeds: [embed] });
    } else {
      await interaction.followUp("No current shop offers available.");
    }
  },
};
