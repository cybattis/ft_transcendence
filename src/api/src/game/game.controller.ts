import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './entity/Game.entity';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Get('info/:id')
  async infoGame(@Param('id') id: number) {
    return await this.gameService.getInfoGame(id);
  }
}
