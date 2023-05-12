import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entity/Game.entity';
import { Repository } from 'typeorm';
import { GameDto } from './dto/game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async createGame(body: GameDto): Promise<Game> {
    const game: Game = new Game();

    console.log(body);

    game.mode = body.mode;
    game.type = body.type;
    game.players = [body.Players[0], body.Players[1]];
    game.scoreP1 = body.scoreP1;
    game.scoreP2 = body.scoreP2;

    return this.gameRepository.save(game);
  }
}
