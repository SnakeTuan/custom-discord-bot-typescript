import fs from "fs";
import { ensureUsersFolder, removeDupeAlerts } from "./validate";
import { defaultSettings } from "./val-setting";

export class User {
  id: string;
  puuid: string;
  auth: string;
  alerts: any[];
  username: string;
  region: string;
  authFailures: number;
  lastFetchedData: number;
  lastNoticeSeen: string;
  lastSawEasterEgg: number;

  constructor({
    id,
    puuid,
    auth,
    alerts = [],
    username,
    region,
    authFailures,
    lastFetchedData,
    lastNoticeSeen,
    lastSawEasterEgg,
  }: {
    id: string;
    puuid: string;
    auth: string;
    alerts?: any[];
    username: string;
    region: string;
    authFailures?: number;
    lastFetchedData?: number;
    lastNoticeSeen?: string;
    lastSawEasterEgg?: number;
  }) {
    this.id = id;
    this.puuid = puuid;
    this.auth = auth;
    this.alerts = alerts || [];
    this.username = username;
    this.region = region;
    this.authFailures = authFailures || 0;
    this.lastFetchedData = lastFetchedData || 0;
    this.lastNoticeSeen = lastNoticeSeen || "";
    this.lastSawEasterEgg = lastSawEasterEgg || 0;
  }
}

const userFilenameRegex = /\d+\.json/;

export const getUserList = (): string[] => {
  ensureUsersFolder();
  return fs
    .readdirSync("../val-data/users")
    .filter((filename) => userFilenameRegex.test(filename))
    .map((filename) => filename.replace(".json", ""));
};

export const readUserJson = (id: string) => {
  try {
    return JSON.parse(fs.readFileSync("../val-data/users/" + id + ".json", "utf-8"));
  } catch (e) {
    return null;
  }
};

export const saveUserJson = (id: string, json: any) => {
  ensureUsersFolder();
  fs.writeFileSync("./val-data/users/" + id + ".json", JSON.stringify(json, null, 2));
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
  const userJson = readUserJson(user.id);
  if (userJson) {
    // check for duplicate accounts
    let foundDuplicate = false;
    for (let i = 0; i < userJson.accounts.length; i++) {
      if (userJson.accounts[i].puuid === user.puuid) {
        const oldUser = userJson.accounts[i];

        // merge the accounts
        userJson.accounts[i] = user;
        userJson.currentAccount = i + 1;

        // copy over data from old account
        user.alerts = removeDupeAlerts(oldUser.alerts.concat(userJson.accounts[i].alerts));
        user.lastFetchedData = oldUser.lastFetchedData;
        user.lastNoticeSeen = oldUser.lastNoticeSeen;
        user.lastSawEasterEgg = oldUser.lastSawEasterEgg;

        foundDuplicate = true;
      }
    }

    if (!foundDuplicate) {
      userJson.accounts.push(user);
      userJson.currentAccount = userJson.accounts.length;
    }

    saveUserJson(user.id, userJson);
  } else {
    const objectToWrite = {
      accounts: [user],
      currentAccount: 1,
      settings: defaultSettings,
    };
    saveUserJson(user.id, objectToWrite);
  }
};
