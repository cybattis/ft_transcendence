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
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { UserInfo, UserSettings } from '../type/user.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { diskStorage } from 'multer';
import jwt_decode from 'jwt-decode';
import * as fs from 'fs';
import { TokenGuard } from '../guard/token.guard';
import { TokenData } from '../type/jwt.type';

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

  /*
   * GET /user/profile/me
   * @desc Get user info from token for homepage
   */
  @UseGuards(TokenGuard)
  @Get('profile/me')
  async meInfo(@Headers('token') header: Headers): Promise<UserInfo> {
    const payload: any = this.jwtService.decode(header.toString());
    if (payload) {
      return this.userService.userInfo(header.toString(), payload.id);
    }
    throw new ForbiddenException('Invalid token');
  }

  /*
   * GET /user/profile/:id
   * @desc Get user public info from id for profile page
   */
  @UseGuards(TokenGuard)
  @Get('profile/:username')
  async userInfo(
    @Param('username') username: string,
    @Headers('token') header: Headers,
  ): Promise<UserInfo | any> {
    return this.userService.userInfo(header.toString(), username);
  }

  @Get('check/login/:input')
  async checkNicknameInUse(@Param('input') input: string) {
    return await this.userService.findByLogin(input);
  }

  @Get('check/email/:input')
  async checkEmailInUse(@Param('input') input: string) {
    return await this.userService.findByEmail(input);
  }

  @Put('disconnect')
  async disconnectUser(@Body() body: number) {
    return await this.userService.changeOnlineStatus(body, false);
  }

  @UseGuards(TokenGuard)
  @Get('leaderboard')
  async leaderboard(): Promise<UserInfo[]> {
    return await this.userService.leaderboard();
  }

  @UseGuards(TokenGuard)
  @Get('settings')
  async userSettings(@Headers('token') header: Headers): Promise<User | null> {
    return await this.userService.userSettings(header.toString());
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

  @Put('blockUsr/:username')
  async blockFriendUsr(@Param('username') username: string, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.blockFriendUsr(username, payload.id);
  }

  @Put('block/:id')
  async blockFriend(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.blockFriend(id, payload.id);
  }

  @Put('unblock/:id')
  async unblockFriend(@Param('id') id: number, @Req() req: any) {
    const payload: any = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    );
    return await this.userService.unblockFriend(id, payload.id);
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
}
