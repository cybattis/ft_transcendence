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
import { TypeCheckers } from '../utils/type-checkers';
import { channel } from 'diagnostics_channel';

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
   * GET /user/profile/:nickname
   * @desc Get user public info from nickname for profile page
   */
  @UseGuards(TokenGuard)
  @Get('profile/:username')
  async userInfo(
    @Param('username') username: string,
    @Headers('Authorization') header: Headers,
  ): Promise<UserInfo | any> {
    const token = header.toString().split(' ')[1];
    return this.userService.userInfo(username);
  }

  @UseGuards(TokenGuard)
  @Get('my-profile')
  async myProfile(
    @Headers('Authorization') header: Headers,
  ): Promise<UserInfo | any> {
    const tokens = header.toString().split(' ');
    if (tokens.length !== 2) throw new BadRequestException();

    const decoded = this.jwtService.decode(tokens[1]);
    if (!TypeCheckers.isTokenData(decoded)) throw new BadRequestException();

    return this.userService.userInfo(decoded.nickname);
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
  async userSettings(
    @Headers('Authorization') header: Headers,
  ): Promise<User | null> {
    const token = header.toString().split(' ')[1];
    return await this.userService.userSettings(token);
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
          const token = req.headers.authorization?.split(' ')[1];
          if (!token)
            throw new ForbiddenException('Token invalid, please login again.');
          const data: TokenData = jwt_decode(token);
          const path = `./avatar/${data.id}`;

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
    @Headers('Authorization') header: Headers,
    @Req() req: any,
  ) {
    if (req?.fileValidationError === 'UNSUPPORTED_FILE_TYPE') {
      throw new BadRequestException('Accepted file are: jpg, jpeg, png, gif');
    }
    const token = header.toString().split(' ')[1];
    return this.userService.updateAvatar(file.path, token);
  }

  @UseGuards(TokenGuard)
  @Put('update')
  async updateSettings(
    @Body() body: UserSettings,
    @Headers('Authorization') header: Headers,
  ) {
    const token = header.toString().split(' ')[1];
    try {
      return await this.userService.updateUserSettings(body, token);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(TokenGuard)
  @Get('friends-data/:id')
  async getFriends(@Param('id') id: number) {
    return await this.userService.getFriends(id);
  }

  @UseGuards(TokenGuard)
  @Get('notifs')
  async getNotifs(@Headers('Authorization') header: Headers) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    if (payload) return await this.userService.getNotifs(payload.id);
  }

  @UseGuards(TokenGuard)
  @Get('friends/online')
  async getOnlineFriendsList(@Headers('Authorization') header: Headers) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.getOnlineFriendsList(payload.id);
  }

  @UseGuards(TokenGuard)
  @Get('friends/offline')
  async getOfflineFriendsList(@Headers('Authorization') header: Headers) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.getOfflineFriendsList(payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('request/:id')
  async requestFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.requestFriend(id, payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('remove/:id')
  async removeFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.removeFriend(id, payload.id);
  }

  @UseGuards(TokenGuard)
  @Get('blockedList')
  async getBlockedList(@Headers('Authorization') header: Headers) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.getBlockedList(payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('blockUsr/:username')
  async blockFriendUsr(
    @Param('username') username: string,
    @Headers('Authorization') header: Headers,
  ) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    const blockedUser: User | null = await this.userService.findByLogin(
      username,
    );
    if (!blockedUser) throw new ForbiddenException('User does not exist');
    return await this.userService.blockFriend(blockedUser.id, payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('unblockUsr/:username')
  async unblockFriendUsr(
    @Param('username') username: string,
    @Headers('Authorization') header: Headers,
  ) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    const blockedUser: User | null = await this.userService.findByLogin(
      username,
    );
    if (!blockedUser) throw new ForbiddenException('User does not exist');
    return await this.userService.unblockFriend(blockedUser.id, payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('block/:id')
  async blockFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ) {
    const payload = this.jwtService.decode(
      header.toString().split(' ')[1],
    ) as TokenData | null;
    if (!payload) return;
    return await this.userService.blockFriend(id, payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('unblock/:id')
  async unblockFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ) {
    const payload = this.jwtService.decode(
      header.toString().split(' ')[1],
    ) as TokenData | null;
    if (!payload) return;
    return await this.userService.unblockFriend(id, payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('accept/:id')
  async acceptFriendRequest(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ) {
    const userID = this.jwtService.decode(
      header.toString().split(' ')[1],
    ) as TokenData;

    console.log('friend request accepted by: ', id, userID.id);
    return await this.userService.acceptFriendRequest(id, userID.id);
  }

  @UseGuards(TokenGuard)
  @Put('decline/:id')
  async declineFriendRequest(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ) {
    const userID = this.jwtService.decode(
      header.toString().split(' ')[1],
    ) as TokenData;

    console.log('friend request declined by: ', id, userID.id);
    return await this.userService.declineFriendRequest(id, userID.id);
  }

  @UseGuards(TokenGuard)
  @Get('requested')
  async requests(@Headers('Authorization') header: Headers) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.requests(payload.id);
  }

  @UseGuards(TokenGuard)
  @Put('customization/paddleColor')
  async updatePaddleColor(
    @Body() body: { color: string },
    @Headers('Authorization') header: Headers,
  ): Promise<void> {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );

    const clientId = payload.id;

    const result: boolean = await this.userService.updatePaddleColor(
      clientId,
      body.color,
    );

    if (!result) {
      const actualPaddleColor = await this.userService.getPaddleColor(clientId);
      throw new BadRequestException({
        message: 'Invalid color',
        paddleColor: actualPaddleColor,
      });
    }
  }

  @UseGuards(TokenGuard)
  @Get('customization/paddleColor/:id')
  async getPaddleColor(@Param('id') id: number): Promise<string> {
    return await this.userService.getPaddleColor(id);
  }

  @UseGuards(TokenGuard)
  @Get('request/channel')
  async fetchInvChannel(@Headers('Authorization') header: Headers) {
    const payload: any = this.jwtService.decode(
      header.toString().split(' ')[1],
    );
    return await this.userService.fetchInvChannel(payload.id);
  }
}
