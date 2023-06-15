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
  nickname: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface tokenData {
  email: string;
  id: number;
  iat: number;
  exp: number;
}
