import { CommandInteraction, EmbedBuilder } from "discord.js";

const colorMap: any = {
  "0cebb8be-46d7-c12a-d306-e9907bfc5a25": 0x009984,
  "e046854e-406c-37f4-6607-19a9ba8426fc": 0xf99358,
  "60bca009-4182-7998-dee7-b8a2558dc369": 0xd1538c,
  "12683d76-48d7-84a3-4e09-6985794f0445": 0x5a9fe1,
  "411e4a55-4e59-7757-41f0-86a53f101bb5": 0xf9d563,
};

const remainingTime = (expireTime: number) => {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const remainingSeconds = expireTime - currentTime;
  let timeLeft = "Expired";
  if (remainingSeconds > 0) {
    const days = Math.floor(remainingSeconds / (60 * 60 * 24));
    const hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    timeLeft = `${days}d ${hours}h ${minutes}m`;
  }
  return timeLeft;
};

export const embedShopMessage = (interaction: CommandInteraction, user: any, shop: any, skins: any) => {
  console.log("Creating embed message for shop...");
  //   console.log("expire time: ", shop.offers.expires);

  const mainEmbed = new EmbedBuilder()
    .setColor(0x1abc9c)
    .setAuthor({
      name: `${user.username}'s Daily Shop`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setDescription(`Expired in **${remainingTime(shop.offers.expires)}**`);

  const offerItems = shop.offers.daily_offers;

  const item0Embed = new EmbedBuilder()
    .setColor(colorMap[skins["skins"][offerItems[0]]["rarity"]])
    .setTitle(skins["skins"][offerItems[0]]["names"]["es-ES"])
    .setImage(skins["skins"][offerItems[0]]["icon"])
    .addFields({
      name: "Price",
      value: `${shop.offers.daily_items[0].Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]} VP`,
      inline: true,
    });

  const item1Embed = new EmbedBuilder()
    .setColor(colorMap[skins["skins"][offerItems[1]]["rarity"]])
    .setTitle(skins["skins"][offerItems[1]]["names"]["es-ES"])
    .setImage(skins["skins"][offerItems[1]]["icon"])
    .addFields({
      name: "Price",
      value: `${shop.offers.daily_items[1].Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]} VP`,
      inline: true,
    });

  const item2Embed = new EmbedBuilder()
    .setColor(colorMap[skins["skins"][offerItems[2]]["rarity"]])
    .setTitle(skins["skins"][offerItems[2]]["names"]["es-ES"])
    .setImage(skins["skins"][offerItems[2]]["icon"])
    .addFields({
      name: "Price",
      value: `${shop.offers.daily_items[2].Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]} VP`,
      inline: true,
    });

  const item3Embed = new EmbedBuilder()
    .setColor(colorMap[skins["skins"][offerItems[3]]["rarity"]])
    .setTitle(skins["skins"][offerItems[3]]["names"]["es-ES"])
    .setImage(skins["skins"][offerItems[3]]["icon"])
    .addFields({
      name: "Price",
      value: `${shop.offers.daily_items[3].Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]} VP`,
      inline: true,
    });

  return [mainEmbed, item0Embed, item1Embed, item2Embed, item3Embed];
};
