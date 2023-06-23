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
  UseGuards,
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
import { TokenGuard } from '../guard/token.guard';

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

  @UseGuards(TokenGuard)
  @Get('profile/:id')
  async userInfo(
    @Param('id') id: number,
    @Headers('token') header: Headers,
  ): Promise<UserInfo | any> {
    return this.userService.userInfo(header.toString(), id);
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
  async disconnectUser(@Body() body: number) {
    return await this.userService.changeOnlineStatus(body, false);
  }

  @UseGuards(TokenGuard)
  @Get('leaderboard')
  async leaderboard(): Promise<UserInfo[]> {
    return this.userService.leaderboard();
  }

  @UseGuards(TokenGuard)
  @Get('settings')
  async userSettings(@Headers('token') header: Headers): Promise<User | null> {
    return this.userService.userSettings(header.toString());
  }

  @UseGuards(TokenGuard)
  @Post('upload/avatar')
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
          const userId: TokenData = jwt_decode(req.headers.token as string);
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
    @Headers('token') header: Headers,
    @Req() req: any,
  ) {
    if (req?.fileValidationError === 'UNSUPPORTED_FILE_TYPE') {
      throw new BadRequestException('Accepted file are: jpg, jpeg, png, gif');
    }
    return this.userService.updateAvatar(file.path, header.toString());
  }

  @UseGuards(TokenGuard)
  @Put('update')
  async updateSettings(
    @Body() body: UserSettings,
    @Headers('token') header: Headers,
  ) {
    try {
      return await this.userService.updateUserSettings(body, header.toString());
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(TokenGuard)
  @Put('update/2fa')
  async update2FA(@Headers('token') header: Headers) {
    try {
      return await this.userService.update2FA(header.toString());
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
