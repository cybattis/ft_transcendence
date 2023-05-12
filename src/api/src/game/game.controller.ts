import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './entity/Game.entity';
import { GameDto } from './dto/game.dto';

@Controller('game')
export class GameController {
  @Inject(GameService)
  private readonly gameService: GameService;

  @Get()
  async findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Post('create')
  async createGame(@Body() body: GameDto): Promise<Game> {
    return this.gameService.createGame(body);
  }
}
