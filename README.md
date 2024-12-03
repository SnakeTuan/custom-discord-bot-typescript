# Creating my custom discord bot

play music and check the daily shop in the valorant game, for the bois :3

## Requirement

Here I am using discord.js 14 so the Node.js should be 18 or newer

## prepare the bot

- go to [Discord Developers Portal](https://discord.com/developers/applications) and create a discord bot

- go to bot section, create the bot and save its token somewhere safe

- go to OAuth2 section for generating URL to invite the bot, select "bot" and "applications.commands" under scopes, and for the bot's permissions, choose permissions based on what you want the bot to do

- use the generated URL to invite the bot to your Discord server

## Quick start

install the packages: `npm i`

create a file name ".env" and add: `TOKEN = your_discord_bot_token`

quick start the bot: `npm run dev` -> Check if the bot go online in your server

deploy the bot: go to the server which added the bot, run `!shrek` (_And yes, that's the command I use. You can rename it in deploy-commands.ts if you prefer something else_)

try playing a song with `/play <the url or the keyword to search>`

login to Riot Game: `/cookies <your cookies>` (How to get cookies: check the link I put below)

check your daily shop (after logging in of course): `/shop`

## Update in future (maybe)

- Queue command handling: Right now, the bot’s chill because not many users spam it

- Better Riot login: Logging in with cookies is so 2000s. I had a username/password login working before, but Riot threw a wrench in it with CAPTCHA. If I ever have time (and patience), I'll fix it. Maybe haha

## Many thanks to

- [Giorgio's Skinpeek](https://github.com/giorgi-o/SkinPeek/tree/master), and [Valapidocs](https://valapidocs.techchrism.me) for better understanding how the login of Riot Game work. And [how to get cookies](https://github.com/giorgi-o/SkinPeek/wiki/How-to-get-your-Riot-cookies)

- [Misa bot discord](https://github.com/misa198/misa-bot-discord), I learn how the discord bot work and how it is built from
