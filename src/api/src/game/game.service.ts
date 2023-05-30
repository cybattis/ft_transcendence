import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entity/Game.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entity/Users.entity';
import { UserService } from '../user/user.service';
import { GameBodyDto, GameType } from '../type/game.type';
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

  async findUserGames(userId: number): Promise<Game[] | string> {
    const user: User | null = await this.userRepository.findOne({
      relations: ['games'],
      where: { id: userId },
    });

    if (!user) return 'No games found';
    return user.games;
  }

  async createGame(body: GameBodyDto): Promise<Game> {
    const game: Game = new Game();

    game.mode = body.mode;
    game.type = body.type;

    const user1 = await this.userService.findByID(body.ids[0]);
    if (!user1) throw new InternalServerErrorException('User not found');

    const user2 = await this.userService.findByID(body.ids[1]);
    if (!user2) throw new InternalServerErrorException('User not found');

    game.players = [user1, user2];

    game.ids = body.ids;

    game.scoreP1 = body.scoreP1;
    game.scoreP2 = body.scoreP2;
    game.status = body.status;

    await this.gameRepository.save(game);

    if (body.scoreP1 > body.scoreP2) {
      await this.updateUserStats(user1, user2, body.type);
    } else await this.updateUserStats(user2, user1, body.type);

    return game;
  }

  async updateUserStats(
    user1: User,
    user2: User,
    ranked: GameType,
  ): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        totalGameWon: user1.totalGameWon + 1,
        xp: user1.xp + 150,
      })
      .where('id = :id', { id: user1.id })
      .execute();
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        xp: user2.xp + 100,
      })
      .where('id = :id', { id: user2.id })
      .execute();
    if (ranked === GameType.RANKED) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          ranking: user1.ranking + 10,
        })
        .where('id = :id', { id: user1.id })
        .execute();
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          ranking: user2.ranking - 10,
        })
        .where('id = :id', { id: user2.id })
        .execute();
    }
  }
}
