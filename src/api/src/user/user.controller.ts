import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';

@Controller('user')
export class UserController {
  private gameService: GameService;
  constructor(private userService: UserService, private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
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

  @Get(':id')
  async findGames(@Param('id') id: number): Promise<any> {
    return this.gameService.findUserGames(id);
  }
}
