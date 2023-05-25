export enum GameType {
  PRACTICE = "Practice",
  CASUAL = "Casual",
  RANKED = "Ranked",
}

export enum GameMode {
  V1 = "1v1",
  V2 = "2v2",
}

export enum GameStatus {
  IN_PROGRESS = "In progress",
  FINISHED = "Finished",
}

export interface GameBodyDto {
  type: GameType;
  mode: GameMode;
  ids: number[];
  scoreP1: number;
  scoreP2: number;
  status: GameStatus;
}
