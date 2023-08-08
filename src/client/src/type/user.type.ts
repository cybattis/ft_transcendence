import { GameStatsDto } from "./game.type";

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
  blockedId: number[];
  blockedById: number[];
  totalGameWon?: number;
  joinChannel: [],
  paddleColor: string;
}

export interface UserSettings {
  nickname: string;
  firstname: string;
  lastname: string;
  email?: string;
  avatarUrl?: string;
  authActivated?: boolean;
}

export interface UserFriend {
  friendsId: number[],
  requestedId: number[],
  blockedId: number[],
  blockedById: number[],
}

export interface FriendRequestDto {
  targetID: number;
}
