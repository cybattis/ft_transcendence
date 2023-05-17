import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get(':userId')
  async findGames(@Param('userId') userId: number): Promise<any> {
    return this.gameService.findGame(userId);
  }

  @Post('create')
  async createGame(@Body() body: GameBodyDto): Promise<Game> {
    return this.gameService.createGame(body);
  }
}
