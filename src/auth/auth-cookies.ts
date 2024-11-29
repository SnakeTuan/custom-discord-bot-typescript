import { fetch } from "@/utils/custom-fetch";
import { detectCloudflareBlock } from "./cloud-flare";
import { processAuthResponse } from "./auth";
import { addUser } from "@/utils/val-user";

export const redeemCookies = async (id: string, cookies: string) => {
  try {
    const req = await fetch(
      "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1",
      {
        headers: {
          "user-agent": "ShooterGame/13 Windows/10.0.19043.1.256.64bit",
          cookie: cookies,
        },
      }
    );

    console.assert(req.statusCode === 303, `Cookie Reauth status code is ${req.statusCode}!`, req);

    if (detectCloudflareBlock(req)) return { success: false, rateLimit: "cloudflare" };

    if (req.headers.location && req.headers.location.startsWith("/login")) return false; // invalid cookies

    // console.log('req.headers: ', req.headers)
    // console.log('req.body: ', req.body)
    const getCookieHeader = req.headers["set-cookie"];
    const combine_cookies = {
      ...parseSetCookie(cookies),
      ...parseSetCookie(getCookieHeader),
    };

    console.log("combine_cookies: ", combine_cookies);

    const user = await processAuthResponse(id, { combine_cookies }, req.headers.location);
    addUser(user);

    return true;
  } catch (e) {
    console.error("Error redeeming cookies:");
    return false;
  }
};

export const parseSetCookie = (setCookie: any) => {
  if (!setCookie) {
    console.error("Riot didn't return any cookies during the auth request! Cloudflare might have something to do with it...");
    return {};
  }

  const cookies: Record<string, string> = {};
  for (const cookie of setCookie) {
    const sep = cookie.indexOf("=");
    cookies[cookie.slice(0, sep)] = cookie.slice(sep + 1, cookie.indexOf(";"));
  }
  return cookies;
};
