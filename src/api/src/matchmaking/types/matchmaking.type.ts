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