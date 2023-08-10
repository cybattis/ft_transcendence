import { UserInfo } from "./user.type";

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

export interface GameStatsDto extends GameBodyDto {
  creationDate: string;
  players: UserInfo[];
}

export interface GameInfos {
  id: number;
  playerOne: {
    me: boolean;
    hasWin: boolean;
    username: string;
    avatar?: string;
    elo: number;
    scoreP1: number;
  };
  playerTwo: {
    me: boolean;
    hasWin: boolean;
    username: string;
    avatar?: string;
    elo: number;
    scoreP2: number;
  };
  mode: GameMode;
  type: GameType;
  status: GameStatus;
}
