import { GameBodyDto } from './game.type';

export interface UserInfo {
  id: number;
  nickname: string;
  xp: number;
  level: number;
  ranking: number;
  avatarUrl?: string;
  games?: GameBodyDto[];
  totalGameWon?: number;
}
