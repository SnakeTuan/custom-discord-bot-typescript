import fs from "fs";
import { ensureUsersFolder, removeDupeAlerts } from "./handle-file";
import { defaultSettings } from "./val-setting";

import { User } from "@/types/user";

const userFilenameRegex = /\d+\.json/;

export const getUserList = (): string[] => {
  ensureUsersFolder();
  return fs
    .readdirSync("val-data/users")
    .filter((filename) => userFilenameRegex.test(filename))
    .map((filename) => filename.replace(".json", ""));
};

export const readUserJson = (id: string) => {
  try {
    return JSON.parse(fs.readFileSync("val-data/users/" + id + ".json", "utf-8"));
  } catch (e) {
    return null;
  }
};

export const saveUserJson = (id: string, json: any) => {
  ensureUsersFolder();
  fs.writeFileSync("val-data/users/" + id + ".json", JSON.stringify(json, null, 2));
};

export const getUserJson = (id: string, account: any | null = null) => {
  const user = readUserJson(id);
  if (!user) return null;

  if (!user.accounts) {
    const userJson = {
      accounts: [user],
      currentAccount: 1,
      settings: defaultSettings,
    };
    saveUserJson(id, userJson);
    return userJson.accounts[account || 1];
  }

  account = account || user.currentAccount || 1;
  if (account > user.accounts.length) account = 1;
  return user.accounts[account - 1];
};

export const getUser = (id: any, account = null) => {
  console.log("Finding riot user with this discord id: ", id);
  if (id instanceof User) {
    const user = id;
    const userJson = readUserJson(user.id);
    if (!userJson) return null;

    const userData = userJson.accounts.find((a: any) => a.puuid === user.puuid);
    return userData && new User(userData);
  }
  try {
    const userData = getUserJson(id, account);
    return userData && new User(userData);
  } catch (e) {
    return null;
  }
};

export const addUser = (user: any) => {
  const objectToWrite = {
    accounts: [user],
    currentAccount: 1,
    settings: defaultSettings,
  };
  saveUserJson(user.id, objectToWrite);
};

export const saveUser = (user: any, account = null) => {
  if (!fs.existsSync("val-data/users")) fs.mkdirSync("val-data/users");

  const objectToWrite = {
    accounts: [user],
    currentAccount: 1,
    settings: defaultSettings,
  };
  saveUserJson(user.id, objectToWrite);
};
