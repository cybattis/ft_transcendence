import { IsEnum, IsNumber } from 'class-validator';
import { User } from '../../user/entity/Users.entity';
import { GameMode, GameType } from '../../type/game.type';

export class GameDto {
  @IsEnum(GameType)
  type: GameType;

  @IsEnum(GameMode)
  mode: GameMode;

  @IsNumber({}, { each: true })
  players: User[];

  @IsNumber()
  scoreP1: number;

  @IsNumber()
  scoreP2: number;
}
