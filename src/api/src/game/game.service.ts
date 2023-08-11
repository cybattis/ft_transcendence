import { Injectable, NotFoundException, OnModuleInit, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entity/Game.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entity/Users.entity';
import { UserService } from '../user/user.service';
import { GameBodyDto, GameInfos, GameStatus, GameType, } from '../type/game.type';
import { ModuleRef } from '@nestjs/core';
import { ScoreUpdate } from '../multiplayer/types/multiplayer.types';
import { APIError } from "../utils/errors";
import { Result, success } from "../utils/Error";

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

  async onModuleInit() {
    this.userService = this.moduleRef.get(UserService, { strict: false });

    const allGames = await this.gameRepository.find();
    for (const game of allGames) {
      if (game.status === GameStatus.WAITING_FOR_PLAYERS || game.status === GameStatus.IN_PROGRESS) {
        game.status = GameStatus.FINISHED;
        await this.gameRepository.save(game);
      }
    }
  }

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async findUserGames(userId: number): Promise<Game[]> {
    const user: User | null = await this.userRepository.findOne({
      relations: ['games'],
      where: { id: userId },
    });

    if (!user)
      return [];
    return user.games;
  }

  async createGame(body: GameBodyDto): Promise<Result<Game, typeof APIError.UserNotFound>> {
    const game: Game = new Game();

    game.mode = body.mode;
    game.type = body.type;

    const user1 = await this.userService.findByID(body.ids[0]);
    if (user1.isErr()) throw new NotFoundException('User not found');

    const user2 = await this.userService.findByID(body.ids[1]);
    if (user2.isErr()) throw new NotFoundException('User not found');

    game.players = [user1.value, user2.value];

    game.ids = body.ids;

    game.scoreP1 = body.scoreP1;
    game.scoreP2 = body.scoreP2;
    game.status = body.status;

    user1.value.inGame = true;
    user2.value.inGame = true;
    await this.userRepository.save(user1.value);
    await this.userRepository.save(user2.value);

    const updated = await this.gameRepository.save(game);
    return success(updated);
  }

  async updateUserStats(
    user1: User,
    user2: User,
    ranked: GameType,
    score: { u1: number; u2: number },
  ): Promise<void> {

    user1.xp = user1.xp + 200 + 50 + score.u1 * 5;

    user2.xp = user2.xp + 200 + score.u2 * 5;

    if ((user1.level === 1 && user1.xp > 1000)
      || user1.xp > 1000 * user1.level + user1.level * 200)
    {
      user1.level = user1.level + 1;
    }

    if ((user2.level === 1 && user2.xp > 1000)
      || user2.xp > 1000 * user2.level + user2.level * 200)
    {
      user2.level = user2.level + 1;
    }

    if (ranked === GameType.RANKED) {
      user1.totalGameWon = user1.totalGameWon + 1;
      user1.ranking = user1.ranking + 10;
      user2.ranking = user2.ranking - 10;
    }

    await this.userRepository.save(user1);
    await this.userRepository.save(user2);
  }

  async fetchUserGames(user: User) {
    const games: Game[] = [];
    for (let i = 0; i < user.games.length; i++) {
      const game: Game | null = await this.gameRepository.findOne({
        relations: { players: true },
        where: { id: user.games[i].id },
      });
      if (game === null)
        continue;
      games[i] = game;
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

  async getInfoGame(id: number): Promise<GameInfos | null> {
    const userID = Number(id);
    const games = await this.findUserGames(userID);
    if (games.length === 0)
      return null;

    const actualGame: Game = games[games.length - 1];
    const playerOne: User | null = await this.userRepository.findOne({
      where: { id: actualGame.ids[0] },
    });
    const playerTwo: User | null = await this.userRepository.findOne({
      where: { id: actualGame.ids[1] },
    });
    if (playerOne && playerTwo) {
      const isPlayerOne = actualGame.ids[0] === userID;
      const isPlayerTwo = actualGame.ids[1] === userID;

      return {
        id: actualGame.id,
        playerOne: {
          me: isPlayerOne,
          hasWin: actualGame.status === GameStatus.FINISHED ? actualGame.scoreP1 > actualGame.scoreP2
            : actualGame.status === GameStatus.PLAYER2_DISCONNECTED,
          username: playerOne.nickname,
          avatar: playerOne.avatarUrl,
          elo: playerOne.ranking,
          scoreP1: actualGame.scoreP1,
        },
        playerTwo: {
          me: isPlayerTwo,
          hasWin: actualGame.status === GameStatus.FINISHED ? actualGame.scoreP2 > actualGame.scoreP1
            : actualGame.status === GameStatus.PLAYER1_DISCONNECTED,
          username: playerTwo.nickname,
          avatar: playerTwo.avatarUrl,
          elo: playerTwo.ranking,
          scoreP2: actualGame.scoreP2,
        },
        mode: actualGame.mode,
        type: actualGame.type,
        status: actualGame.status,
      };
    }

    return null;
  }
}
