import { GameBodyDto } from "./game.type";

export interface UserInfo {
  nickname: string;
  xp: number;
  level: number;
  ranking: number;
  avatar?: string;
  games?: GameBodyDto[];
  totalGamePlayed?: number;
}
