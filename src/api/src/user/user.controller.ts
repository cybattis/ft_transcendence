import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
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
import { tokenData } from '../type/user.type';
import { diskStorage } from 'multer';
import jwt_decode from 'jwt-decode';
import * as fs from 'fs';

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

  @Get('settings/:token')
  async userSettings(@Param('token') token: string): Promise<User | null> {
    const decoded: tokenData = this.jwtService.decode(token) as tokenData;
    return this.userService.userSettings(decoded.id);
  }

  @Post('upload/:token')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 2097152 },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(
            new Error(
              'Only image files with jpg/jpeg/png/gif extensions are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: (req, file, callback) => {
          const userId: tokenData = jwt_decode(
            req.url.split('/user/upload/')[1],
          );
          const path = `./avatar/${userId.id}`;

          fs.mkdirSync(path, { recursive: true });

          fs.readdir(path, (err, files) => {
            if (err) throw err;

            fs.unlink(path + '/' + files[0], (err) => {
              if (err) throw err;
            });
          });

          callback(null, path);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('token') token: string,
  ) {
    console.log('controller: ', file);
    return this.userService.updateAvatar(file.path, token);
  }
}
