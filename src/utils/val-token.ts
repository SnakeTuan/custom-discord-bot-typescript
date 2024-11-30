import { getUser } from "./val-user";
import { stringifyCookies, deleteUserAuth } from "@/auth/auth";
import { redeemCookies } from "@/auth/auth-cookies";

export const decodeToken = (token: any) => {
  const encodedPayload = token.split(".")[1];
  return JSON.parse(atob(encodedPayload));
};

export const tokenExpiry = (token: any) => {
  return decodeToken(token).exp * 1000;
};

export const refreshToken = async (id: string, account = null) => {
  console.log(`Refreshing token for ${id}...`);
  let response: any = { success: false };

  let user = getUser(id, account);
  if (!user) return response;

  if (user.auth.cookies) {
    response = await redeemCookies(id, stringifyCookies(user.auth.cookies));
  }

  if (!response.success && !response.mfa && !response.rateLimit) deleteUserAuth(user);

  return response;
};
