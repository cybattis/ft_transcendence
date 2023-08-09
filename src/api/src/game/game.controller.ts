import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './entity/Game.entity';
import {GameInfos} from "../type/game.type";

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Get('info/:id')
  async infoGame(@Param('id') id: number): Promise<GameInfos> {
    const game = await this.gameService.getInfoGame(id);
    if (!game)
      throw new NotFoundException('Game not found');

    return game;
  }
}
