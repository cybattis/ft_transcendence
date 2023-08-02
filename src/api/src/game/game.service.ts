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
import { GameBodyDto, GameStatus, GameType } from '../type/game.type';
import { ModuleRef } from '@nestjs/core';
import { ScoreUpdate } from '../multiplayer/types/multiplayer.types';

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
    return game;
  }

  async updateUserStats(
    user1: User,
    user2: User,
    ranked: GameType,
    score: { u1: number; u2: number },
  ): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        totalGameWon: user1.totalGameWon + 1,
        xp: user1.xp + 200 + 50 + score.u1 * 5,
      })
      .where('id = :id', { id: user1.id })
      .execute();
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        xp: user2.xp + 200 + score.u2 * 5,
      })
      .where('id = :id', { id: user2.id })
      .execute();

    if (
      (user1.level === 1 && user1.xp > 1000) ||
      user1.xp > 1000 * user1.level + user1.level * 200
    ) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          level: user1.level + 1,
        })
        .where('id = :id', { id: user1.id })
        .execute();
    }

    if (
      (user2.level === 1 && user2.xp > 1000) ||
      user2.xp > 1000 * user2.level + user2.level * 200
    ) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          level: user2.level + 1,
        })
        .where('id = :id', { id: user2.id })
        .execute();
    }

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

  async fetchUserGames(user: User) {
    const games: Game[] = [];
    for (let i = 0; i < user.games.length; i++) {
      const game: Game | null = await this.gameRepository.findOne({
        relations: { players: true },
        where: { id: user.games[i].id },
      });
      games[i] = game as Game;
    }
    return games;
  }

  /*
   * Update a game score
   *
   * @param gameId The id of the game
   * @param scoreUpdate The updated score
   */
  public async updateGameScore(
    gameId: number,
    scoreUpdate: ScoreUpdate,
  ): Promise<void> {
    await this.gameRepository
      .createQueryBuilder()
      .update(Game)
      .set({
        scoreP1: scoreUpdate.player1Score,
        scoreP2: scoreUpdate.player2Score,
      })
      .where('id = :id', { id: gameId })
      .execute();
  }

  /*
   * Update a game status
   *
   * @param gameId The id of the game
   * @param status The updated status
   */
  public async updateGameStatus(
    gameId: number,
    status: GameStatus,
  ): Promise<void> {
    await this.gameRepository
      .createQueryBuilder()
      .update(Game)
      .set({
        status: status,
      })
      .where('id = :id', { id: gameId })
      .execute();
  }

  async getInfoGame(id: number) {
    const games: any = await this.findUserGames(id);
    if (games)
    {
      for (let i = 0; games[i]; i ++)
      {
        if (games[i].status !== "Finished" && games[i].status !== "Player disconnected")
        {
          const actualGame: Game = games[i];
          const playerOne: User | null = await this.userRepository.findOne({where: {id: actualGame.ids[0]}});
          const playerTwo: User | null = await this.userRepository.findOne({where: {id: actualGame.ids[1]}});
          if (playerOne && playerTwo)
          {
            const result = {
              id: actualGame.id,
              playerOne: {
                username: playerOne.nickname,
                avatar: playerOne.avatarUrl,
                elo: playerOne.ranking,
              },
              playerTwo: {
                username: playerTwo.nickname,
                avatar: playerTwo.avatarUrl,
                elo: playerTwo.ranking,
              },
              mode: actualGame.mode,
              type: actualGame.type,
            }
            return result;
          }
        }
      }
    }
    return ;
  }
}
