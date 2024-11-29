import { asyncReadFile } from "@/utils/json";
import { Proxy } from "./proxy";
import { config } from "@/utils/val-config";
import { fetch } from "@/utils/custom-fetch";
import { checkRateLimit } from "@/checkRateLimit/rate-limit";

enum ProxyType {
  HTTP = "http",
  HTTPS = "https",
  SOCKS = "socks",
}

export class ProxyManager {
  private allProxies: Proxy[];
  private activeProxies: { [key: string]: Proxy[] };
  private deadProxies: Proxy[];
  private enabled: boolean;

  constructor() {
    this.allProxies = [];

    this.activeProxies = {
      "example.com": [],
    };
    this.deadProxies = [];

    this.enabled = false;
  }

  async loadProxies(): Promise<void> {
    const proxyFile = await asyncReadFile("data/proxies.txt").catch((_) => {});
    if (!proxyFile) {
      return;
    }

    let type = ProxyType.HTTPS;
    let username: string | undefined = undefined;
    let password: string | undefined = undefined;

    // for each line in proxies.txt
    for (const line of proxyFile.toString().split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.length || trimmed.startsWith("#")) {
        continue;
      }

      // split by colons
      const parts = trimmed.split(":");
      if (parts.length < 2) {
        continue;
      }

      // first part is the proxy host
      const host = parts[0];
      if (!host.length) {
        continue;
      }

      // second part is the proxy port
      const port = parseInt(parts[1]);
      if (isNaN(port)) {
        continue;
      }

      // third part is the proxy type
      const typeString = parts[2]?.toLowerCase() || ProxyType.HTTPS;
      if (!Object.values(ProxyType).includes(typeString as ProxyType)) {
        console.error(`Unsupported proxy type ${typeString}!`);
        continue;
      }
      type = typeString as ProxyType;

      // fourth part is the proxy username
      username = parts[3] || undefined;

      // fifth part is the proxy password
      password = parts[4] || undefined;

      // create the proxy object
      const proxy = new Proxy({
        type,
        host,
        port,
        username,
        password,
        manager: this,
      });

      // add it to the list of all proxies
      this.allProxies.push(proxy);
    }

    this.enabled = this.allProxies.length > 0;
  }

  async loadForHostname(hostname: any) {
    if (!this.enabled) return;

    // called both to load the initial set of proxies for a hostname,
    // and to repopulate the list if the current set has an invalid one

    const activeProxies = this.activeProxies[hostname] || [];
    const promises = [];

    const proxyFailed = async (proxy: any) => {
      this.deadProxies.push(proxy);
    };

    for (const proxy of this.allProxies) {
      if (!this.allProxies.length) break;
      if (activeProxies.length >= config.maxActiveProxies) break;
      if (activeProxies.includes(proxy)) continue;
      if (this.deadProxies.includes(proxy)) continue;

      /*try {
                const proxyWorks = await proxy.test();
                if(!proxyWorks) {
                    this.deadProxies.push(proxy);
                    continue;
                }

                await proxy.createAgent(hostname);
                activeProxies.push(proxy);
            } catch(err) {
                console.error(err);
                this.deadProxies.push(proxy);
            }*/

      let timedOut = false;
      const promise = proxy
        .test()
        .then((proxyWorks) => {
          if (!proxyWorks) return Promise.reject(`Proxy ${proxy.host}:${proxy.port} failed!`);
          if (timedOut) return Promise.reject();

          return proxy.createAgent(hostname);
        })
        .then((/*agent*/) => {
          if (timedOut) return;

          activeProxies.push(proxy);
        })
        .catch((err) => {
          if (err) console.error(err);
          proxyFailed(proxy);
        });

      const promiseWithTimeout = promiseTimeout(promise, 5000).then((res) => {
        if (res === null) {
          timedOut = true;
          console.error(`Proxy ${proxy.host}:${proxy.port} timed out!`);
        }
      });
      promises.push(promiseWithTimeout);
    }

    await Promise.all(promises);

    if (!activeProxies.length) {
      console.error(`No working proxies found!`);
      return;
    }

    console.log(`Loaded ${activeProxies.length} proxies for ${hostname}`);
    this.activeProxies[hostname] = activeProxies;

    return activeProxies;
  }

  async getProxy(hostname: any) {
    if (!this.enabled) return null;

    const activeProxies = await this.loadForHostname(hostname);
    if (!activeProxies?.length) return null;

    let proxy: any;
    do {
      proxy = activeProxies.shift();
    } while (this.deadProxies.includes(proxy));
    if (!proxy) return null;

    activeProxies.push(proxy);
    return proxy;
  }

  async getProxyForUrl(url: any) {
    const hostname = new URL(url).hostname;
    return this.getProxy(hostname);
  }

  async proxyIsDead(proxy: any, hostname: any) {
    this.deadProxies.push(proxy);
    await this.loadForHostname(hostname);
  }

  async fetch(url: any, options = {}): Promise<Response | void> {
    // if(!this.enabled) return await fetch(url, options);
    if (!this.enabled) return;

    const hostname = new URL(url).hostname;
    const proxy = await this.getProxy(hostname);
    if (!proxy) return fetch(url, options) as unknown as Promise<Response>;

    const agent = await proxy.createAgent(hostname);
    const req = await fetch(url, {
      ...options,
      proxy: agent.createConnection,
    });

    // test for 1020 or rate limit
    const hostnameAndProxy = `${new URL(url).hostname} proxy=${proxy.host}:${proxy.port}`;
    if ((req.statusCode === 403 && req.body === "error code: 1020") || checkRateLimit(req, hostnameAndProxy)) {
      console.error(`Proxy ${proxy.host}:${proxy.port} is dead!`);
      console.error(req);
      await this.proxyIsDead(proxy, hostname);
      return await this.fetch(url, options);
    }
  }
}

interface WaitFunction {
  (ms: number): Promise<void>;
}

export const wait: WaitFunction = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const promiseTimeout = async (promise: any, ms: any, valueIfTimeout = null) => {
  return await Promise.race([promise, wait(ms).then(() => valueIfTimeout)]);
};
