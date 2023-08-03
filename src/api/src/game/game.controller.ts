import { Body, Controller, Get, Post, Param } from '@nestjs/common';
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

  @Post('create')
  async createGame(@Body() body: GameBodyDto): Promise<Game> {
    return this.gameService.createGame(body);
  }

  @Get('info/:id')
  async infoGame(@Param('id') id: number) {
    return await this.gameService.getInfoGame(id);
  }
}
