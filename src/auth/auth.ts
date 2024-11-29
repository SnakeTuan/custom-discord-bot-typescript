import { extractTokensFromUri, decodeToken, getAccountWithPuuid } from "@/utils/val-auth";
import { User } from "@/utils/val-user";
import { config } from "@/utils/val-config";

export const processAuthResponse = async (id: string, authData: any, redirect: any, user: any | null = null) => {
  if (!user) {
    user = new User({
      id,
      puuid: "",
      auth: "",
      username: "",
      region: "",
    });
  }
  const [rso, idt] = extractTokensFromUri(redirect);
  if (rso == null) {
    console.error("Riot servers didn't return an RSO token!");
    console.error(
      "Most likely the Cloudflare firewall is blocking your IP address. Try hosting on your home PC and seeing if the issue still happens."
    );
    throw new Error("Riot servers didn't return an RSO token!");
  }

  user.auth = {
    ...user.auth,
    rso: rso,
    idt: idt,
  };

  // save either cookies or login/password
  if (authData.login && config.storePasswords && !user.auth.waiting2FA) {
    // don't store login/password for people with 2FA
    user.auth.login = authData.login;
    user.auth.password = btoa(authData.password);
    delete user.auth.cookies;
  } else {
    user.auth.cookies = authData.cookies;
    delete user.auth.login;
    delete user.auth.password;
  }

  user.puuid = decodeToken(rso).sub;

  const existingAccount = getAccountWithPuuid(id, user.puuid);
  if (existingAccount) {
    user.username = existingAccount.username;
    user.region = existingAccount.region;
    if (existingAccount.auth) user.auth.ent = existingAccount.auth.ent;
  }

  // get username
  const userInfo = await getUserInfo(user);
  if (userInfo) {
    user.username = userInfo.username;
  }

  // get entitlements token
  if (!user.auth.ent) user.auth.ent = await getEntitlements(user);

  // get region
  if (!user.region) user.region = await getRegion(user);

  user.lastFetchedData = Date.now();

  user.authFailures = 0;
  return user;
};

export const parseSetCookie = (setCookie: any) => {
  if (!setCookie) {
    console.error("Riot didn't return any cookies during the auth request! Cloudflare might have something to do with it...");
    return {};
  }

  const cookies: { [key: string]: string } = {};
  for (const cookie of setCookie) {
    const sep = cookie.indexOf("=");
    cookies[cookie.slice(0, sep)] = cookie.slice(sep + 1, cookie.indexOf(";"));
  }
  return cookies;
};

export const getUserInfo = async (user: any) => {
  const req = await fetch("https://auth.riotgames.com/userinfo", {
    headers: {
      Authorization: "Bearer " + user.auth.rso,
    },
  });
  console.assert(req.status === 200, `User info status code is ${req.status}!`, req);
  const bodyText = await req.text();
  const json = JSON.parse(bodyText);
  if (json.acct)
    return {
      puuid: json.sub,
      username: json.acct.game_name && json.acct.game_name + "#" + json.acct.tag_line,
    };
};

const getEntitlements = async (user: any) => {
  const req = await fetch("https://entitlements.auth.riotgames.com/api/token/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.auth.rso,
    },
  });
  console.assert(req.status === 200, `Auth status code is ${req.status}!`, req);
  const bodyText = await req.text();
  const json = JSON.parse(bodyText);
  return json.entitlements_token;
};

export const getRegion = async (user: any) => {
  const req = await fetch("https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.auth.rso,
    },
    body: JSON.stringify({
      id_token: user.auth.idt,
    }),
  });
  console.assert(req.status === 200, `PAS token status code is ${req.status}!`, req);
  const bodyText = await req.text();
  const json = JSON.parse(bodyText);
  return json.affinities.live;
};
