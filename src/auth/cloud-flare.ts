export const detectCloudflareBlock = (req: any) => {
  const blocked =
    req.statusCode === 403 && req.headers["x-frame-options"] === "SAMEORIGIN";

  if (blocked) {
    console.error(
      "[ !!! ] Error 1020: Your bot might be rate limited, it's best to check if your IP address/your hosting service is blocked by Riot - try hosting on your own PC to see if it solves the issue?"
    );
  }

  return blocked;
};
