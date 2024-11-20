import messages from '../../collections/messages';
import { QueueItem, Server, servers } from '../../server';
import { YoutubeService } from '@/services/youtube';
import { Platform } from '../../types/song';
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { CommandInteraction, GuildMember } from 'discord.js';
import { createEmbedMessage } from '../../utils/create-embed-message';

export const play = {
  name: 'play',
  execute: async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    let server = servers.get(interaction.guildId as string);
    if (!server) {
      if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
        const channel = interaction.member.voice.channel;
        console.log(`Joining voice channel: ${channel.name}`);
        server = new Server(
          joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
          }),
          interaction.guildId as string,
        );
        servers.set(interaction.guildId as string, server);
      }
    }

    if (!server) {
      console.log("User is not in a voice channel");
      await interaction.followUp(messages.joinVoiceChannel);
      return;
    }

    // Make sure the connection is ready before processing the user's request
    try {
      console.log("Waiting for voice connection to be ready...");
      await entersState(server.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
    } catch (error) {
      console.error("Failed to join voice channel:", error);
      await interaction.followUp(messages.failToJoinVoiceChannel);
      return;
    }

    try {
      const input = interaction.options.get('input')!.value! as string;
      console.log(`Received input: ${input}`);
      const playListId = YoutubeService.isPlaylist(input);
      if (playListId) {
        console.log("Input is a playlist");
        const playlist = await YoutubeService.getPlaylist(playListId);
        const songs = playlist.songs.map((song) => {
          const queueItem: QueueItem = {
            song,
            requester: interaction.member?.user.username as string,
          };
          return queueItem;
        });
        await server.addSongs(songs);
        console.log(`Added ${songs.length} songs to the queue`);
        interaction.followUp({
          embeds: [
            createEmbedMessage({
              title: playlist.title,
              url: input,
              author: playlist.author,
              thumbnail: playlist.thumbnail,
              type: 'Playlist',
              length: playlist.songs.length,
              platform: Platform.YOUTUBE,
              requester: interaction.member?.user.username as string,
            }),
          ],
        });
      } else {
        console.log("Input is a single video");
        const song = await YoutubeService.getVideoDetails(input);
        const queueItem: QueueItem = {
          song,
          requester: interaction.member?.user.username as string,
        };
        await server.addSongs([queueItem]);
        console.log(`Added song to the queue: ${song.title}`);
        interaction.followUp({
          embeds: [
            createEmbedMessage({
              title: song.title,
              url: song.url,
              author: song.author,
              thumbnail: song.thumbnail,
              type: 'Song',
              length: song.length,
              platform: Platform.YOUTUBE,
              requester: interaction.member?.user.username as string,
            }),
          ],
        });
      }
    } catch (error) {
      console.error("Failed to play:", error);
      await interaction.followUp(messages.failToPlay);
    }
  },
};
