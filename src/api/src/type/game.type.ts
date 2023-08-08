import { UserInfo } from './user.type';

export enum GameType {
  PRACTICE = 'Practice',
  CASUAL = 'Casual',
  RANKED = 'Ranked',
}

export enum GameMode {
  V1 = '1v1',
  V2 = '2v2',
}

export enum GameStatus {
  WAITING_FOR_PLAYERS = 'Waiting for players',
  IN_PROGRESS = 'In progress',
  FINISHED = 'Finished',
  PLAYER_DISCONNECTED = 'Player disconnected',
}

export interface GameBodyDto {
  type: GameType;
  mode: GameMode;
  ids: number[];
  scoreP1: number;
  scoreP2: number;
  status: GameStatus;
}

export interface GameStats extends GameBodyDto {
  creationDate: string;
}
