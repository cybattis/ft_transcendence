import { Socket } from "socket.io";
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
}

export type PendingRankedGame = {
  player1: RankedMatchmakingPlayer;
  player1Ready: boolean;
  player2: RankedMatchmakingPlayer;
  player2Ready: boolean;
}

export type CasualGameInvite = {
  invitedPlayerId: number;
  invitingPlayer: CasualMatchmakingPlayer;
}

export type RankedGameInvite = {
  invitedPlayerId: number;
  invitingPlayer: RankedMatchmakingPlayer;
}
