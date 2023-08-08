import {Body, Controller, Get, NotFoundException, Post} from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './entity/Game.entity';
import { GameBodyDto } from '../type/game.type';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }
}
