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

export type MatchmakingJoinMatchmakingCallback = {
  (): void;
}

export type MatchmakingLeaveMatchmakingCallback = {
  (): void;
}

export type MatchmakingAcceptFoundGameCallback = {
  (): void;
}

export type MatchmakingMatchFoundCallback = {
  (acceptTimeout: number): void;
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
