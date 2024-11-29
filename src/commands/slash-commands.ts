// Defines the bot's slash commands for interacting with users.

import { ApplicationCommandData, ApplicationCommandOptionType } from 'discord.js';

export const schema: ApplicationCommandData[] = [
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
  {
    name: "login",
    description: "Log in with your Riot username/password!",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "username",
            description: "Your Riot username",
            required: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "password",
            description: "Your Riot password",
            required: true
        },
    ]
  },
  {
    name: "cookies",
    description: "Log in with your cookies",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "cookies",
            description: "Your cookies which can be taken from the browser",
            required: true
        },
    ]
  },
  {
    name: "shop",
    description: "Show your current daily shop!",
    options: [{
        type: ApplicationCommandOptionType.User,
        name: "user",
        description: "Optional: see the daily shop of someone else!",
        required: false
    }]
  },
];
