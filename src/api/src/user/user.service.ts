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
    return this.usersRepository.findOne({ where: { id: id } });
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

  async userSettings(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: id },
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

  async userInfo(id: number): Promise<UserInfo | any> {
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

    if (!user) return 'User not found';
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
    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    const user = await this.usersRepository.findOne({
      where: { id: decoded.id },
    });
    if (!user) return null;

    return await this.usersRepository.update(decoded.id, {
      authActivated: !user.authActivated,
    });
  }

  async changeOnlineStatus(id: number, state: boolean) {
    await this.usersRepository.update(id, { online: state });
  }

  async updateAvatar(path: string, token: string) {
    if (!token) return null;
    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    const user = await this.usersRepository.findOne({
      where: { id: decoded.id },
      relations: ['games'],
    });
    if (!user) return null;
    user.avatarUrl = 'http://localhost:5400/' + path;
    await this.usersRepository.save(user);

    return user.avatarUrl;
  }

  async updateUserSettings(body: UserSettings, token: TokenData) {
    const user = await this.usersRepository.findOne({
      where: { id: token.id },
    });
    if (!user) return null;

    if (token.email !== body.email) {
      const checkEmail = await this.findByEmail(body.email);
      if (checkEmail) {
        throw new BadRequestException('Email already in use');
      }
      await this.mailService.sendNewEmailConfirmation(user, body.email);
    }

    user.nickname = body.nickname;
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    await this.usersRepository.save(user);
    return user;
  }
}
