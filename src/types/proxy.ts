import http from "http";
import https from "https";
import { fetch } from "@/utils/custom-fetch";

enum ProxyType {
  HTTP = "http",
  HTTPS = "https",
  SOCKS = "socks",
}

interface ProxyOptions {
  manager: any;
  type?: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export class Proxy {
  manager: any;
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  publicIp: string | null;

  constructor({ manager, type, host, port, username, password }: ProxyOptions) {
    this.manager = manager;
    this.type = type || ProxyType.HTTPS;
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;

    this.publicIp = null;
  }

  createAgent(hostname: string) {
    if (this.type !== ProxyType.HTTPS) throw new Error("Unsupported proxy type " + this.type);

    return new Promise((resolve, reject) => {
      const headers: { [key: string]: string } = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Host": hostname,
      };
      if (this.username && this.password) {
        headers["Proxy-Authorization"] = "Basic " + Buffer.from(this.username + ":" + this.password).toString("base64");
      }

      const req = http.request({
        host: this.host,
        port: this.port,
        method: "CONNECT",
        path: hostname + ":443",
        headers: headers,
        timeout: 10,
      });
      console.log(`Sent proxy connection request to ${this.host}:${this.port} for ${hostname}`);

      req.on("connect", (res, socket) => {
        console.log(`Proxy ${this.host}:${this.port} connected to ${hostname}!`);
        if (res.statusCode !== 200) {
          reject(`Proxy ${this.host}:${this.port} returned status code ${res.statusCode}!`);
        }

        socket.on("error", (err) => {
          console.error(`Proxy ${this.host}:${this.port} socket errored: ${err}`);
          this.manager.proxyIsDead(this, hostname);
        });

        const agent = new https.Agent({ socket });
        resolve(agent);
      });

      req.on("error", (err) => {
        reject(`Proxy ${this.host}:${this.port} errored: ${err}`);
      });

      req.end();
    });
  }

  async test() {
    const res: any = await fetch("https://api.ipify.org", {
      proxy: (await this.createAgent("api.ipify.org")) as https.Agent,
    });

    if (res.status !== 200) {
      console.error(`Proxy ${this.host}:${this.port} returned status code ${res.status}!`);
      return false;
    }

    const ip = res.body.trim();
    if (!ip) {
      console.error(`Proxy ${this.host}:${this.port} returned no IP!`);
      return false;
    }

    this.publicIp = ip;
    return true;
  }
}
