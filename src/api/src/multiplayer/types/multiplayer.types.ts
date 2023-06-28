import { GameMode, GameStatus, GameType } from "../../type/game.type";
import { AuthedSocket } from "../../auth/types/auth.types";

export type GameRoom = {
  id: number;
  player1Id: number;
  player2Id: number;
  player1Socket?: AuthedSocket;
  player2Socket?: AuthedSocket;
  type: GameType;
  mode: GameMode;
  status: GameStatus;
  player1Score: number;
  player2Score: number;
  player1Ready: boolean;
  player2Ready: boolean;
}

export type MovementUpdate = {
  finalY: number;
}

export type PlayerSocket = AuthedSocket & {
  game: GameRoom;
}
