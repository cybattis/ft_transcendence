import { IsArray, IsEnum, IsNumber } from 'class-validator';
import { GameMode, GameType } from '../entity/Game.entity';

export class GameDto {
  @IsEnum(GameType)
  type: GameType;

  @IsEnum(GameMode)
  mode: GameMode;

  @IsArray()
  Players: number[];

  @IsNumber()
  scoreP1: number;

  @IsNumber()
  scoreP2: number;
}
