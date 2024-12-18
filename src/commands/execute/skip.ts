import messages from "@/collections/messages";
import { servers } from "@/server";
import { CommandInteraction } from "discord.js";

export const skip = {
    name: "skip",
    execute: async (interaction: CommandInteraction) => {
      await interaction.deferReply();
      const server = servers.get(interaction.guildId as string);
      if (!server) {
        await interaction.followUp(messages.joinVoiceChannel);
        return;
      }
      if (server.queue.length === 0) {
        await interaction.followUp(messages.noSongsInQueue);
      }
      await server.play();
      if (server.playing) {
        await interaction.followUp(messages.skippedSong);
      }
    },
  };