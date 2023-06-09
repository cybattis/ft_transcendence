import { GameStatsDto } from "./game.type";

export interface UserInfo {
  id: number;
  nickname: string;
  xp: number;
  level: number;
  ranking: number;
  avatarUrl?: string;
  games?: GameStatsDto[];
  totalGameWon?: number;
}

export interface UserSettings {
  id: number;
  nickname: string;
  avatarUrl?: string;
  email: string;
  firstName: string;
  lastName: string;
}
