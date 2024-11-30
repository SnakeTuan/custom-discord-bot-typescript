import { config } from "dotenv";
config();

if (process.env.NODE_ENV === "production") {
  require("module-alias/register");
}

import { Client, GatewayIntentBits } from "discord.js";
import { deploy } from "./commands/deploy-command";
import { SoundCloud } from "scdl-core";
import messages from "./collections/messages";
import { play } from "./commands/execute/play";
import { skip } from "./commands/execute/skip";
import { help } from "./commands/execute/help";
import { ping } from "./commands/execute/ping";
import { shop } from "./commands/execute/shop";
import { soundcloud } from "./commands/execute/soundcloud";
import { cookies } from "./commands/execute/cookies";
import { getSkinList } from "./caches/save-skin";
import { fetchRiotVersionData } from "./auth/riot";

export const discordTag = (id: any) => {
  const user = client.users.cache.get(id);
  return user ? `${user.username}#${user.discriminator}` : id;
};

let gameVersion: any = null;

console.log("Starting bot...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.on("ready", () => {
  console.log(`> Bot is ready as ${client.user?.tag}`);
});

client
  .login(process.env.TOKEN)
  .then(async () => {
    console.log("Logged in successfully");
    await SoundCloud.connect();
    deploy(client);
    gameVersion = fetchRiotVersionData();
    if (gameVersion) {
      console.log("Fetched latest Riot user-agent!");
    } else {
      console.log("FAILED to fetch latest Riot user-agent!");
    }
    getSkinList(gameVersion).then(() => console.log("Fetched skin list!"));
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand() || !interaction.guildId) return;
      try {
        switch (interaction.commandName) {
          case play.name:
            play.execute(interaction);
            break;
          case skip.name:
            skip.execute(interaction);
            break;
          case help.name:
            help.execute(interaction);
            break;
          case ping.name:
            ping.execute(client, interaction);
            break;
          case soundcloud.name:
            soundcloud.execute(interaction);
            break;
          case cookies.name:
            cookies.execute(interaction);
            break;
          case shop.name:
            shop.execute(interaction);
            break;
        }
      } catch (e) {
        interaction.reply(messages.error);
      }
    });
  })
  .catch((error) => {
    console.error("Failed to login:", error);
  });
