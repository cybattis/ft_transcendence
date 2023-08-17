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
  ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChannelInvite,
  UserFriend,
  UserFriendsData,
  UserInfo,
  UserSettings
} from '../type/user.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { diskStorage } from 'multer';
import jwt_decode from 'jwt-decode';
import * as fs from 'fs';
import { TokenGuard } from '../guard/token.guard';
import { TokenData } from '../type/jwt.type';
import { TypeCheckers } from '../utils/type-checkers';
import {APIError} from "../utils/errors";
import {decodeTokenOrThrow, getTokenOrThrow} from "../utils/tokenUtils";
import {TypeConverters} from "../utils/type-converters";

@Controller('user')
export class UserController{
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async findAll(): Promise<UserInfo[]> {
    const result = await this.userService.findAll();
    const infos: UserInfo[] = [];
    result.forEach((user) => {
      infos.push(TypeConverters.fromUserToUserInfo(user));
    });
    return infos;
  }

  /*
   * GET /user/profile/:nickname
   * Get user public info from nickname for profile page
   */
  @UseGuards(TokenGuard)
  @Get('profile/nickname/:username')
  async userInfo(
    @Param('username') username: string,
  ): Promise<UserInfo> {
    const result = await this.userService.userInfo(username);

    if (result.isErr())
      throw new NotFoundException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('profile/id/:id')
  async userInfoId(
    @Param('id') id: number,
  ): Promise<UserInfo> {
    const result = await this.userService.userInfoByID(Number(id));

    if (result.isErr())
      throw new NotFoundException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('my-profile')
  async myProfile(
    @Headers('Authorization') header: Headers
  ): Promise<UserInfo> {
    const decoded = decodeTokenOrThrow(header, this.jwtService);

    const result = await this.userService.findByID(decoded.id);
    if (result.isErr())
      throw new ForbiddenException();
    return TypeConverters.fromUserToUserInfo(result.value);
  }

  @Get('check/login/:input')
  async checkNicknameInUse(@Param('input') input: string): Promise<boolean> {
    return (await this.userService.findByLogin(input)).isOk();
  }

  @Get('check/email/:input')
  async checkEmailInUse(@Param('input') input: string): Promise<boolean> {
    return (await this.userService.findByEmail(input)).isOk();
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
  ): Promise<UserSettings> {
    const decoded = decodeTokenOrThrow(header, this.jwtService);

    const result = await this.userService.userSettings(decoded);
    if (result.isErr())
      throw new ForbiddenException();
    return result.value;
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
          if (!TypeCheckers.isTokenData(data))
            throw new ForbiddenException('Token invalid, please login again.');
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
  async uploadFile(
    @UploadedFile()
      file: Express.Multer.File,
    @Headers('Authorization') header: Headers,
    @Req() req: any,
  ): Promise<string> {
    if (req?.fileValidationError === 'UNSUPPORTED_FILE_TYPE') {
      throw new BadRequestException('Accepted file are: jpg, jpeg, png, gif');
    }
    const token = getTokenOrThrow(header);
    const result = await this.userService.updateAvatar(file.path, token);
    if (result.isErr())
        throw new ForbiddenException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('update')
  async updateSettings(
    @Body() body: UserSettings,
    @Headers('Authorization') header: Headers,
  ): Promise<UserSettings> {
    const token = getTokenOrThrow(header);
    const result = await this.userService.updateUserSettings(body, token);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
        case APIError.InvalidToken:
          throw new ForbiddenException();
        case APIError.InvalidNickname:
          throw new BadRequestException('Invalid nickname');
        case APIError.NicknameAlreadyTaken:
          throw new BadRequestException('Nickname already taken');
      }
    }

    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('friends-data/:id')
  async getFriends(@Param('id') id: number): Promise<UserFriendsData> {
    const result = await this.userService.getFriendData(Number(id));
    if (result.isErr())
      throw new NotFoundException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('notifs')
  async getNotifs(@Headers('Authorization') header: Headers): Promise<boolean> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.hasNotifs(payload.id);
    if (result.isErr())
      throw new ForbiddenException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('friends/status')
  async getFriendsStatus(@Headers('Authorization') header: Headers): Promise<UserFriend[]> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.getFriendsListStatus(payload.id);
    if (result.isErr())
      throw new ForbiddenException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('friend-request/:id')
  async requestFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ): Promise<void> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.requestFriend(Number(id), payload.id);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.OtherUserNotFound:
          throw new NotFoundException();
      }
    }
  }

  @UseGuards(TokenGuard)
  @Put('remove-friend/:id')
  async removeFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ): Promise<UserFriendsData> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.removeFriend(Number(id), payload.id);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.OtherUserNotFound:
          throw new NotFoundException();
      }
    }

    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('blockedList')
  async getBlockedList(@Headers('Authorization') header: Headers)
  : Promise<string[]> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.getBlockedList(payload.id);
    if (result.isErr())
      throw new ForbiddenException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('block-user/:id')
  async blockFriendUsr(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ): Promise<UserFriendsData> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.blockFriend(Number(id), payload.id);

    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.OtherUserNotFound:
          throw new NotFoundException();
      }
    }

    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('unblock/:id')
  async unblockFriend(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ): Promise<UserFriendsData> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.unblockFriend(Number(id), payload.id);

    if (result.isErr()) {
      switch(result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.OtherUserNotFound:
          throw new NotFoundException();
      }
    }

    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('accept/:id')
  async acceptFriendRequest(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ): Promise<UserFriendsData> {
    const payload = decodeTokenOrThrow(header, this.jwtService);

    console.log('friend request accepted by: ', Number(id), payload.id);
    const result = await this.userService.acceptFriendRequest(Number(id), payload.id);
    if (result.isErr()) {
      switch(result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.OtherUserNotFound :
        case APIError.FriendRequestNotFound:
          throw new NotFoundException();
      }
    }

    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('decline/:id')
  async declineFriendRequest(
    @Param('id') id: number,
    @Headers('Authorization') header: Headers,
  ): Promise<UserFriendsData> {
    const payload = decodeTokenOrThrow(header, this.jwtService);

    console.log('friend request declined by: ', id, payload.id);
    const result = await this.userService.declineFriendRequest(Number(id), payload.id);
    if (result.isErr()) {
      switch(result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.OtherUserNotFound:
        case APIError.FriendRequestNotFound:
          throw new NotFoundException();
      }
    }

    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('requested')
  async requests(@Headers('Authorization') header: Headers): Promise<UserFriend[]> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.requests(payload.id);
    if (result.isErr())
      throw new ForbiddenException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('customization/paddleColor')
  async updatePaddleColor(
    @Body() body: { color: string },
    @Headers('Authorization') header: Headers,
  ): Promise<void> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const clientId = payload.id;

    const result = await this.userService.updatePaddleColor(
      clientId,
      body.color,
    );

    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          throw new ForbiddenException();
        case APIError.InvalidColor: {
          throw new BadRequestException('Invalid color');
        }
      }
    }
  }

  @UseGuards(TokenGuard)
  @Get('customization/paddleColor/:id')
  async getPaddleColor(@Param('id') id: number): Promise<string> {
    const result = await this.userService.getPaddleColor(Number(id));
    if (result.isErr())
      throw new NotFoundException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Get('request/channel')
  async fetchInvChannel(
    @Headers('Authorization') header: Headers,
  ) : Promise<ChannelInvite[]> {
    const payload = decodeTokenOrThrow(header, this.jwtService);
    const result = await this.userService.fetchInvChannel(payload.id);
    if (result.isErr())
      throw new ForbiddenException();
    return result.value;
  }
}
