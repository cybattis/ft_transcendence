import { GameStats } from './game.type';

export interface UserInfo {
  id: number;
  nickname: string;
  xp: number;
  level: number;
  ranking: number;
  avatarUrl?: string;
  games?: GameStats[];
  friendsId: number[];
  requestedId: number[];
  blockedId: number[];
  blockedById: number[];
  totalGameWon?: number;
  paddleColor: string;
}

export interface UserSettings {
  id: number;
  nickname: string;
  firstname: string;
  lastname: string;
  email?: string;
  avatarUrl?: string;
  authActivated?: boolean;
}

export interface UserFriend {
  id: number,
  nickname: string,
  avatarUrl?: string,
  inGame: boolean,
  online: boolean,
}

export interface UserFriendsData {
  id: number,
  friendsId: number[],
  requestedId: number[],
  blockedId: number[],
  blockedById: number[],
  blockedChat: string[],
}

export interface UserCredentials {
  id: number,
  nickname: string,
  email: string,
  password: string,
  isIntra: boolean,
  isVerified: boolean,
}

export interface UserSocketInfo {
  socketId: string;
  nickname: string;
}
