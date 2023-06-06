import { GameMode, GameStatus, GameType } from "../../type/game.type";

export type GameRoom = {
  id: number;
  player1Id: number;
  player2Id: number;
  type: GameType;
  mode: GameMode;
  status: GameStatus;
  player1Score: number;
  player2Score: number;
}
