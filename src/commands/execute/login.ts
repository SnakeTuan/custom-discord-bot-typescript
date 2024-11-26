import { CommandInteraction } from "discord.js";
import fs from "fs";
import path from "path";
import { loginUsernamePassword } from "../../utils/auth-login";

const userDataPath = path.join(__dirname, "../../../data/users.json");

export const login = {
  name: "login",
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const username = interaction.options.get("username")?.value as string;
    const password = interaction.options.get("password")?.value as string;
    if (!username || !password) {
      return interaction.reply("Please provide both username and password.");
    }

    const loginResult = await loginUsernamePassword(username, password);

    if (loginResult.success) {
      const userId = interaction.user.id;
      const userData = {
        accessToken: loginResult.accessToken,
        entitlementsToken: loginResult.entitlementsToken,
        userId: loginResult.userId,
      };

      let users: { [key: string]: any } = {};
      if (fs.existsSync(userDataPath)) {
        const data = fs.readFileSync(userDataPath, "utf-8");
        users = JSON.parse(data);
      }
      users[userId] = userData;
      fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));

      interaction.reply("Logged in successfully!");
    } else {
      interaction.reply("Login failed. Please check your credentials.");
    }
  },
};
