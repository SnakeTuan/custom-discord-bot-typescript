import { fetch } from "@/utils/custom-fetch";

// TODO: find out what how to automatically get the latest one of these
const platformOsVersion = "10.0.19042.1.256.64bit";

export const riotClientHeaders = () => {
  const clientPlatformData = {
    platformType: "PC",
    platformOS: "Windows",
    platformOSVersion: platformOsVersion,
    platformChipset: "Unknown",
  };

  // JSON stringify prettyfied with 1 tab and \r\n, then base64 encode
  const clientPlatformDataJson = JSON.stringify(clientPlatformData, null, "\t");
  const clientPlatformDataBuffer = Buffer.from(clientPlatformDataJson.replace(/\n/g, "\r\n"));
  const clientPlatformDataBase64 = clientPlatformDataBuffer.toString("base64");

  return {
    "X-Riot-ClientPlatform": clientPlatformDataBase64,
    "X-Riot-ClientVersion": getRiotVersionData().riotClientVersion,
  };
};

let riotVersionData: any = null;

export const fetchRiotVersionData = async () => {
  console.log("Fetching latest Valorant version number...");

  const req = await fetch("https://valorant-api.com/v1/version");
  if (req.statusCode !== 200) {
    console.log(`Riot version data status code is ${req.statusCode}!`);
    console.log(req);

    return null;
  }

  const json = JSON.parse(req.body);
  riotVersionData = json.data;

  return riotVersionData;
};

export const getRiotVersionData = () => {
  if (riotVersionData === null) {
    throw "Riot version data is not loaded!";
  }

  return riotVersionData;
};
