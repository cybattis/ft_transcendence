import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { UserInfo } from '../type/user.type';

@Injectable()
export class UserService implements OnModuleInit {
  private gameService: GameService;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
  }

  async findByLogin(nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nickname: nickname } });
  }

  async findByID(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async userInfo(id: number): Promise<UserInfo | any> {
    const user = await this.findByID(id);
    if (!user) return null;

    return {
      id: user.id,
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      ranking: user.ranking,
      avatarUrl: user.avatarUrl,
      games: await this.gameService.findUserGames(id),
      totalGameWon: user.totalGameWon,

      // Channel list ?
      // Friends list ?
      // Achievements ?
    };
  }

  async leaderboard(): Promise<UserInfo[] | any> {
    return this.usersRepository.find({
      order: { ranking: 'DESC' },
      take: 10,
      select: {
        id: true,
        nickname: true,
        ranking: true,
        avatarUrl: true,
        totalGameWon: true,
      },
      relations: {
        games: true,
      },
      where: {
        games: MoreThan(0),
      },
    });
  }

  async isVerified(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email, isVerified: true },
    });
  }

  async authActivated(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email, authActivated: true },
    });
  }

  async updateValidation(id: number) {
    await this.usersRepository.update(id, {
      isVerified: true,
    });
  }

  async updateAuth(id: number) {
    await this.usersRepository.update(id, {
      authActivated: true,
    });
  }

  async changeOnlineStatus(id: number, state: boolean) {
    await this.usersRepository.update(id, { online: state });
  }
}
