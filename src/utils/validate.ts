import fs from "fs";

// check if the folder exists, if not, create it
export const ensureUsersFolder = () => {
  if (!fs.existsSync("val-data")) {
    fs.mkdirSync("val-data");
  }
  if (!fs.existsSync("val-data/users")) {
    fs.mkdirSync("val-data/users");
  }
};

export const removeDupeAlerts = (alerts: any) => {
  const uuids: string[] = [];
  return alerts.filter((alert: { uuid: string }) => {
    if (uuids.includes(alert.uuid)) return false;
    return uuids.push(alert.uuid);
  });
};

