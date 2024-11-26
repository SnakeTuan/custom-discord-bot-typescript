import fs from "fs";

export const asyncReadFile = (path: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

export const asyncReadJSONFile = async (path: string) => {
  return JSON.parse((await asyncReadFile(path)).toString());
};
