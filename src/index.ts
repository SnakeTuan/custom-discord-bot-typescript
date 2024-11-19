import { config } from "dotenv";
config();

if (process.env.NODE_ENV === "production") {
  require("module-alias/register");
}

import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
  ],
});

client.on("ready", () => {
  console.log(`> Bot is on ready`);
});

client.login(process.env.TOKEN);