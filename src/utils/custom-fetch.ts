import { config } from "@/utils/val-config";
import https from "https";
import http from "http";


interface FetchOptions {
  proxy?: https.Agent;
  method?: string;
  headers?: { [key: string]: string };
  encoding?: string;
  body?: any;
}

interface FetchResponse {
  statusCode?: number;
  headers: http.IncomingHttpHeaders;
  body?: any;
}

const tlsCiphers = [
  "TLS_CHACHA20_POLY1305_SHA256",
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-ECDSA-AES128-SHA256",
  "ECDHE-RSA-AES128-SHA256",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "ECDHE-RSA-AES256-GCM-SHA384",
  "ECDHE-ECDSA-AES128-SHA",
  "ECDHE-RSA-AES128-SHA",
  "ECDHE-ECDSA-AES256-SHA",
  "ECDHE-RSA-AES256-SHA",
  "RSA-PSK-AES128-GCM-SHA256",
  "RSA-PSK-AES256-GCM-SHA384",
  "RSA-PSK-AES128-CBC-SHA",
  "RSA-PSK-AES256-CBC-SHA",
];

const tlsSigAlgs = [
  "ecdsa_secp256r1_sha256",
  "rsa_pss_rsae_sha256",
  "rsa_pkcs1_sha256",
  "ecdsa_secp384r1_sha384",
  "rsa_pss_rsae_sha384",
  "rsa_pkcs1_sha384",
  "rsa_pss_rsae_sha512",
  "rsa_pkcs1_sha512",
  "rsa_pkcs1_sha1",
];

export const fetch = (url: string, options: FetchOptions = {}): Promise<FetchResponse> => {
  if (config.logUrls) console.log("Fetching url " + url.substring(0, 200) + (url.length > 200 ? "..." : ""));

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        // agent: options.proxy,
        method: options.method || "GET",
        headers: {
          cookie: "dummy=cookie", // set dummy cookie, helps with cloudflare 1020
          "Accept-Language": "en-US,en;q=0.5", // same as above
          "referer": "https://github.com/giorgi-o/SkinPeek", // to help other APIs see where the traffic is coming from
          ...options.headers,
        },
        ciphers: tlsCiphers.join(":"),
        sigalgs: tlsSigAlgs.join(":"),
        minVersion: "TLSv1.3",
      },
      (resp) => {
        const res: FetchResponse = {
          statusCode: resp.statusCode,
          headers: resp.headers,
          body: undefined,
        };
        let chunks: any = [];
        resp.on("data", (chunk) => chunks.push(chunk));
        resp.on("end", () => {
          res.body = Buffer.concat(chunks).toString((options.encoding as BufferEncoding) || "utf8");
          resolve(res);
        });
        resp.on("error", (err) => {
          console.error(err);
          reject(err);
        });
      }
    );
    req.write(options.body || "");
    req.end();
    req.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
};
