import { Socket } from "socket.io";

export interface CasualMatchmakingPlayer {
  socket: Socket;
  id: number;
}

export interface RankedMatchmakingPlayer {
  socket: Socket;
  id: number;
  rankPoints: number;
}

export type PendingCasualGame = {
  player1: CasualMatchmakingPlayer;
  player1Ready: boolean;
  player2: CasualMatchmakingPlayer;
  player2Ready: boolean;
  creationDate: Date;
}

export type PendingRankedGame = {
  player1: RankedMatchmakingPlayer;
  player1Ready: boolean;
  player2: RankedMatchmakingPlayer;
  player2Ready: boolean;
  creationDate: Date;
}
