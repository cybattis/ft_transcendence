import { GameMode, GameStatus, GameType } from "../../type/game.type";

export type GameRoom = {
  id: number;
  serverRoomId: string;
  player1Id: number;
  player2Id: number;
  type: GameType;
  mode: GameMode;
  status: GameStatus;
  player1Score: number;
  player2Score: number;
  player1Ready: boolean;
  player2Ready: boolean;
  player1Disconnected: boolean;
  player2Disconnected: boolean;
  isServing: boolean;
}

export type MovementUpdate = {
  playerNumber: number;
  finalY: number;
}

export type BallUpdate = {
  x: number;
  y: number;
  velX: number;
  velY: number;
}

export type ScoreUpdate = {
  player1Score: number;
  player2Score: number;
}

export type ServeUpdate = {
  ballUpdate: BallUpdate;
  playerNumber: number;
}
