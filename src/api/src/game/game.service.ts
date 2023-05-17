import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entity/Game.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entity/Users.entity';
import { UserService } from '../user/user.service';
import { GameBodyDto } from '../type/game.type';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class GameService implements OnModuleInit {
  private userService: UserService;
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.userService = this.moduleRef.get(UserService, { strict: false });
  }

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async findGame(userId: number): Promise<Game[] | string> {
    console.log('ID: ', userId);
    const user: User | null = await this.userRepository.findOne({
      relations: ['games'],
      where: { id: userId },
    });

    if (!user) return 'No games found';
    return user.games;
  }

  async createGame(body: GameBodyDto): Promise<Game> {
    const game: Game = new Game();

    console.log(body);
    console.log(body.players[0], body.players[1]);

    game.mode = body.mode;
    game.type = body.type;

    const user1 = await this.userService.findByID(body.players[0]);
    if (!user1) throw new Error('User not found');

    const user2 = await this.userService.findByID(body.players[1]);
    if (!user2) throw new Error('User not found');

    game.players = [user1, user2];

    game.scoreP1 = body.scoreP1;
    game.scoreP2 = body.scoreP2;
    game.status = body.status;

    // await this.userRepository
    //   .createQueryBuilder()
    //   .update(User)
    //   .set({ games: [game] })
    //   .where('id = :id', { id: body.players[0] })
    //   .execute();

    return this.gameRepository.save(game);
  }
}
