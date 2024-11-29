// types/user.ts
export interface UserModel {
  id: string;
  puuid: string;
  auth: any;
  alerts?: any[];
  username: string;
  region: string;
  authFailures?: number;
  lastFetchedData?: number;
  lastNoticeSeen?: string;
  lastSawEasterEgg?: number;
}
