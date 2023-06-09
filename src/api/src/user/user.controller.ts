import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { UserInfo } from '../type/user.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {
  private gameService: GameService;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('profile/:id')
  async userInfo(@Param('id') id: number): Promise<UserInfo | any> {
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

  @Get('leaderboard')
  async leaderboard(): Promise<UserInfo[]> {
    return this.userService.leaderboard();
  }

  @Get('settings/:id')
  async userSettings(@Param('id') id: number): Promise<User | null> {
    return this.userService.userSettings(id);
  }

  @Post('upload/:id')
  @UseInterceptors(
    FileInterceptor('avatar', { dest: 'avatar/', preservePath: true }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
  ) {
    console.log('controller: ', file);
    this.userService.updateAvatar(file.path, id).then((r) => console.log(r));
    return { file: file.path };
  }
}
