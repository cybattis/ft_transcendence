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

  @Get('notifs')
  async getNotifs(@Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.getNotifs(payload.id);
  }

  @Get('friends/online')
  async getOnlineFriendsList(@Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.getOnlineFriendsList(payload.id);
  }

  @Get('friends/offline')
  async getOfflineFriendsList(@Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.getOfflineFriendsList(payload.id);
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

  @Put('request/:id')
  async requestFriend(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.requestFriend(id, payload.id);
  }

  @Put('remove/:id')
  async removeFriend(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.removeFriend(id, payload.id);
  }

  @Put('block/:id')
  async blockFriend(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.blockFriend(id, payload.id);
  }

  @Put('accept/:id')
  async acceptFriendRequest(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.acceptFriendRequest(id, payload.id);
  }

  @Put('decline/:id')
  async declineFriendRequest(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.declineFriendRequest(id, payload.id);
  }

  @Get('requested')
  async requests(@Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.requests(payload.id);
  }

  @Get('leaderboard')
  async leaderboard(): Promise<UserInfo[]> {
    return await this.userService.leaderboard();
  }
}
