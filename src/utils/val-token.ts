import { getUser } from "./val-user";

export const decodeToken = (token: any) => {
  const encodedPayload = token.split(".")[1];
  return JSON.parse(atob(encodedPayload));
};

export const tokenExpiry = (token: any) => {
  return decodeToken(token).exp * 1000;
};
