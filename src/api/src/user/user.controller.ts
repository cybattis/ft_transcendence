import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserInfo } from '../type/user.type';

@Controller('user')
export class UserController {
  private gameService: GameService;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, {strict: false});
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('profile/:id')
  async userInfo(@Param('id') id: number): Promise<any> {
    return this.userService.userInfo(id);
  }

  @Get('check/login/:input')
  async checkNicknameInUse(@Param('input') input: string) {
    return this.userService.findByLogin(input);
  }

  @Get('check/email/:input')
  async checkEmailInUse(@Param('input') input: string) {
    return this.userService.findByEmail(input);
  }

  @Put('disconnect')
  async disconnectUser(@Req() req: any, @Body() body: boolean) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.changeOnlineStatus(payload.id, body);
  }

  @Put('add/:id')
  async addFriend(@Param('id') id: number, @Body() body: number) {
    return await this.userService.addFriend(id, body);
  }
}
  @Get('leaderboard')
  async leaderboard(): Promise<UserInfo[]> {
    return this.userService.leaderboard();
  }
}
