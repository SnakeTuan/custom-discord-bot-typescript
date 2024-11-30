export class User {
  id: string;
  puuid: string;
  auth: string;
  alerts: any[];
  username: string;
  region: string;
  authFailures: number;
  lastFetchedData: number;
  lastNoticeSeen: string;
  lastSawEasterEgg: number;

  constructor({
    id,
    puuid,
    auth,
    alerts = [],
    username,
    region,
    authFailures,
    lastFetchedData,
    lastNoticeSeen,
    lastSawEasterEgg,
  }: {
    id: string;
    puuid: string;
    auth: string;
    alerts?: any[];
    username: string;
    region: string;
    authFailures?: number;
    lastFetchedData?: number;
    lastNoticeSeen?: string;
    lastSawEasterEgg?: number;
  }) {
    this.id = id;
    this.puuid = puuid;
    this.auth = auth;
    this.alerts = alerts || [];
    this.username = username;
    this.region = region;
    this.authFailures = authFailures || 0;
    this.lastFetchedData = lastFetchedData || 0;
    this.lastNoticeSeen = lastNoticeSeen || "";
    this.lastSawEasterEgg = lastSawEasterEgg || 0;
  }
}
