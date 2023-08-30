import { AuthedSocket } from "../../auth/types/auth.types";

export interface CasualMatchmakingPlayer {
  socket: AuthedSocket;
  id: number;
}

export interface RankedMatchmakingPlayer {
  socket: AuthedSocket;
  id: number;
  rankPoints: number;
}

export type PendingCasualGame = {
  player1: CasualMatchmakingPlayer;
  player1Ready: boolean;
  player2: CasualMatchmakingPlayer;
  player2Ready: boolean;
  creationTime: number;
  timer?: NodeJS.Timeout;
}

export type PendingRankedGame = {
  player1: RankedMatchmakingPlayer;
  player1Ready: boolean;
  player2: RankedMatchmakingPlayer;
  player2Ready: boolean;
  creationTime: number;
  timer?: NodeJS.Timeout;
}

export type CasualGameInvite = {
  invitedPlayerId: number;
  invitingPlayer: CasualMatchmakingPlayer;
}

export type RankedGameInvite = {
  invitedPlayerId: number;
  invitingPlayer: RankedMatchmakingPlayer;
}

export enum MatchmakingPlayerStatus {
  NONE = "NONE",
  SEARCHING_CASUAL = "SEARCHING_CASUAL",
  SEARCHING_RANKED = "SEARCHING_RANKED",
  FOUND_CASUAL = "FOUND_CASUAL",
  FOUND_RANKED = "FOUND_RANKED",
  WAITING_CASUAL = "WAITING_CASUAL",
  WAITING_RANKED = "WAITING_RANKED",
}

export type MatchmakingPlayerStatusDTO = {
  status: MatchmakingPlayerStatus;
  timeLeft?: number;
}
