import { GameBodyDto } from "./game.type";

export interface UserInfo {
  id: number;
  nickname: string;
  xp: number;
  level: number;
  ranking: number;
  avatar?: string;
  games?: GameBodyDto[];
  totalGameWon?: number;
}
