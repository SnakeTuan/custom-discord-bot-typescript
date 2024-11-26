export const getValorantVersion = async () => {
  console.log("Fetching current valorant version...");

  const req = await fetch("https://valorant-api.com/v1/version");
  console.assert(
    req.status === 200,
    `Valorant version status code is ${req.status}!`,
    req
  );

  const bodyText = await req.text();
  const json = JSON.parse(bodyText);
  console.assert(
    json.status === 200,
    `Valorant version data status code is ${json.status}!`,
    json
  );

  return json.data;
};

// for test the function:
// getValorantVersion()
//   .then((version) => {
//     console.log("Valorant Version:", version);
//   })
//   .catch((error) => {
//     console.error("Error fetching Valorant version:", error);
//   });
