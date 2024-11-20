import { config } from "dotenv";
config();

if (process.env.NODE_ENV === "production") {
  require("module-alias/register");
}

import { Client, GatewayIntentBits } from "discord.js";
import { deploy } from "./commands/deploy-command";
import { SoundCloud } from 'scdl-core';
import { play } from "./commands/execute/play";
import messages from "./collections/messages";

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

client.login(process.env.TOKEN).then(async() => {
  console.log("Logged in successfully");
  await SoundCloud.connect();
  deploy(client);
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId) return;
    try {
      switch (interaction.commandName) {
        case play.name:
          play.execute(interaction);
          break;
      }
    } catch (e) {
      interaction.reply(messages.error);
    }
  });
}).catch((error) => {
  console.error("Failed to login:", error);
});