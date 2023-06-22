import { GameStatsDto } from './game.type';

export interface UserInfo {
  id: number;
  nickname: string;
  xp: number;
  level: number;
  ranking: number;
  avatarUrl?: string;
  games?: GameStatsDto[];
  friendsId: number[];
  requestedId: number[];
  totalGameWon?: number;
}
