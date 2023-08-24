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

export type MatchmakingSyncCallback = {
  (status: MatchmakingPlayerStatusDTO): void;
}

export type MatchmakingGameStartedCallback = {
  (): void;
}

export type MultiplayerGameStartedCallback = {
  (serveUpdate: ServeUpdate): void;
}

export type MultiplayerGameEndedCallback = {
  (): void;
}

export type MultiplayerScoreUpdateCallback = {
  (scoreUpdate: ScoreUpdate): void;
}

export type MultiplayerMovementUpdateCallback = {
  (movementUpdate: MovementUpdate): void;
}

export type MultiplayerBallUpdateCallback = {
  (ballUpdate: BallUpdate): void;
}

export type MultiplayerServeCallback = {
  (serveUpdate: ServeUpdate): void;
}

export type MultiplayerReadyAckCallback = {
  (playerNumber: number): void;
}

export type PlayerInfos = {
  id: number;
  nickname: string;
  paddleColor: string;
}
