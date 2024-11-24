import messages from '@/collections/messages';
import { CommandInteraction, EmbedBuilder, ApplicationCommandData, ApplicationCommandOptionType, BaseApplicationCommandOptionsData } from 'discord.js';

const helpMessage: ApplicationCommandData[] = [
    {
      name: 'play',
      description: 'Plays a song or playlist on Youtube',
      options: [
        {
          name: 'input',
          type: ApplicationCommandOptionType.String,
          description:
            'The url or keyword to search videos or playlist on Youtube',
          required: true,
        },
      ],
    },
    {
      name: 'soundcloud',
      description: 'Plays a song, album or playlist on SoundCloud',
      options: [
        {
          name: 'input',
          type: ApplicationCommandOptionType.String,
          description:
            'The url or keyword to search videos or playlist on SoundCloud',
          required: true,
        },
      ],
    },
    {
      name: 'skip',
      description: 'Skip to the next song in the queue',
    },
    {
      name: 'ping',
      description: 'See the ping to server',
    },
    {
      name: 'help',
      description: 'See the help for this bot',
    },
  ];

function createEmbedMessage(helpMessage: any) {
    const embed = new EmbedBuilder({
        title: messages.help,
        fields: (helpMessage as BaseApplicationCommandOptionsData[]).map(
           (item, index) => ({
            name: `${index + 1}. ${item.name}`,
            value: item.description,
           })
        )
    })
    return embed;
}

export const help = {
    name: 'help',
    execute: async (interaction: CommandInteraction) => {
      await interaction.deferReply();
      await interaction.followUp({
        embeds: [createEmbedMessage(helpMessage)],
      });
    },
  };