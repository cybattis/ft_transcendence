import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { TokenData, UserInfo, UserSettings } from '../type/user.type';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService implements OnModuleInit {
  private gameService: GameService;
  private jwtService: JwtService;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
  }

  async findByLogin(nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nickname: nickname } });
  }

  async findByID(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email } });
  }

  async findUserAndGetCredential(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email },
      select: ['id', 'nickname', 'email', 'password', 'IsIntra'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserEmail(id: number) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: id },
      select: ['id', 'email'],
    });
    if (!user) throw new BadRequestException('User does not exist');
    return user;
  }

  async userSettings(token: string): Promise<User | null> {
    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    return this.usersRepository.findOne({
      where: { id: decoded.id },
      select: [
        'id',
        'nickname',
        'avatarUrl',
        'email',
        'firstname',
        'lastname',
        'authActivated',
      ],
    });
  }

  async userInfo(token: string, id: number): Promise<UserInfo | any> {
    const user: User | null = await this.usersRepository.findOne({
      select: {
        id: true,
        nickname: true,
        level: true,
        ranking: true,
        avatarUrl: true,
        totalGameWon: true,
        xp: true,
      },
      where: {
        id: id,
      },
    });

    if (!user) throw new BadRequestException('User does not exist');
    user.games = await this.gameService.fetchUserGames(user);
    return user;
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

  async update2FA(token: string) {
    const user = await this.decodeToken(token);
    if (!user) return null;

    return await this.usersRepository.update(user.id, {
      authActivated: !user.authActivated,
    });
  }

  async changeOnlineStatus(id: number, state: boolean) {
    await this.usersRepository.update(id, { online: state });
  }

  async updateAvatar(path: string, token: string) {
    const user = await this.decodeToken(token);
    if (!user) return null;

    user.avatarUrl = 'http://localhost:5400/' + path;
    await this.usersRepository.save(user);

    return user.avatarUrl;
  }

  async updateUserSettings(body: UserSettings, token: string) {
    const user = await this.decodeToken(token);
    if (!user) return null;

    if (user.nickname !== body.nickname) {
      const checkNickname = await this.findByLogin(body.nickname);
      if (checkNickname) {
        throw new BadRequestException('Nickname already taken');
      }
      user.nickname = body.nickname;
    }

    user.firstname = body.firstname;
    user.lastname = body.lastname;
    await this.usersRepository.save(user);
    return user;
  }

  async decodeToken(token: string): Promise<User | null> {
    if (!token) return null;
    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    const user = await this.usersRepository.findOne({
      where: { id: decoded.id },
    });
    if (!user) return null;
    return user;
  }
}
