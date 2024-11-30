import { CommandInteraction } from "discord.js";
import path from "path";
import { redeemCookies } from "@/auth/auth-cookies";

export const cookies = {
  name: "cookies",
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const cookies = interaction.options.get("cookies")?.value as string;
    if (!cookies) {
      return interaction.reply("Please provide your cookies :3");
    }

    const loginResult = await redeemCookies(interaction.user.id, cookies);
    console.log("loginResult: ", loginResult);

    if (loginResult.success) {
      await interaction.followUp("Logged in successfully!");
    } else {
      await interaction.followUp("Login failed. Please check your credentials.");
    }
  },
};
