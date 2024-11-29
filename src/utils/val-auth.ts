import { getUser, readUserJson } from "./val-user";
import { tokenExpiry } from "./val-token";

// export const authUser = async (id: string, account = null) => {
//   // doesn't check if token is valid, only checks it hasn't expired
//   const user = getUser(id, account);
//   if (!user || !user.auth || !user.auth.rso) return { success: false };

//   const rsoExpiry = tokenExpiry(user.auth.rso);
//   if (rsoExpiry - Date.now() > 10_000) return { success: true };

//   return await refreshToken(id, account);
// };

export const extractTokensFromUri = (uri: string) => {
  // thx hamper for regex
  const match = uri.match(/access_token=((?:[a-zA-Z]|\d|\.|-|_)*).*id_token=((?:[a-zA-Z]|\d|\.|-|_)*).*expires_in=(\d*)/);
  if (!match) return [null, null];

  const [, accessToken, idToken] = match;
  return [accessToken, idToken];
};

export const decodeToken = (token: any) => {
  const encodedPayload = token.split(".")[1];
  return JSON.parse(atob(encodedPayload));
};

export const getAccountWithPuuid = (id: any, puuid: any) => {
  const userJson = readUserJson(id);
  if (!userJson) return null;
  return userJson.accounts.find((a: any) => a.puuid === puuid);
};
