import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { TokenData, UserInfo, UserSettings } from '../type/user.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
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
    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    return this.userService.userSettings(decoded.id);
  }

  @Post('upload/:token')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 2097152 },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          req.fileValidationError = 'UNSUPPORTED_FILE_TYPE';
          callback(null, false);
        } else callback(null, true);
      },
      storage: diskStorage({
        destination: (req, file, callback) => {
          const userId: TokenData = jwt_decode(
            req.url.split('/user/upload/')[1],
          );
          const path = `./avatar/${userId.id}`;

          fs.mkdirSync(path, { recursive: true });

          fs.readdir(path, (err, files) => {
            if (err) throw err;
            if (files.length === 0) {
              return;
            }

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
    @Req() req: any,
  ) {
    if (req?.fileValidationError === 'UNSUPPORTED_FILE_TYPE') {
      throw new BadRequestException('Accepted file are: jpg, jpeg, png, gif');
    }
    return this.userService.updateAvatar(file.path, token);
  }

  @Put('update')
  async updateSettings(
    @Body() body: UserSettings,
    @Headers('token') header: Headers,
  ) {
    const decoded: TokenData = this.jwtService.decode(
      header.toString(),
    ) as TokenData;
    try {
      return await this.userService.updateUserSettings(body, decoded);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('update/2fa')
  async update2FA(@Headers('token') header: Headers) {
    try {
      return await this.userService.update2FA(header.toString());
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
