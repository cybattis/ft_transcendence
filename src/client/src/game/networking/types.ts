export type MatchmakingMatchFoundCallback = {
  (acceptTimeout: number): void;
}

export type MatchmakingGameStartedCallback = {
  (): void;
}
