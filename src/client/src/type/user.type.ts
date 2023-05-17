import { GameBodyDto } from "./game.type";

export interface UserInfo {
  nickname: string;
  xp: number;
  avatar?: string;
  games?: GameBodyDto[];
}

export interface UserProfileDto {
  id: number;
  nickname: string;
  firstname: string;
  lastname: string;
}
