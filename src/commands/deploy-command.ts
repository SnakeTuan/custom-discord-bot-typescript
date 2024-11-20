import { Client } from 'discord.js';
import { schema } from './slash-commands';

export const deploy = (client: Client): void => {
    client.on('messageCreate', async (message) => {
        if (!message.guild) {
            console.log("Message is not from a guild");
            return;
        }
        console.log(`Received message: ${message.content}`);
        
        // only owner can deploy
        if (!client.application?.owner) {
            console.log("Fetching application owner...");
            await client.application?.fetch();
            // console.log("data", client.application?.owner);
        }
        if (message.content.toLowerCase() === '!shrek' && message.author.id === client.application?.owner?.id) {
        try {
            console.log("Deploying commands...");
            await message.guild.commands.set(schema);
            await message.reply('Shrek Deployed!');
            console.log("Commands deployed successfully");
        } catch (e) {
            console.error("Failed to deploy commands:", e);
            message.reply('Fail to deploy!');
        }
        } 
        else if (message.content.toLowerCase() === '!shrek' && message.author.id != client.application?.owner?.id) {
            message.reply('Only my owner can deploy me!');
        }
        else{
            // console.log("Message is not a deploy command or author is not the owner");
        }
    });
};