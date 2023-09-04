import {Injectable, OnModuleInit,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {MoreThan, Repository} from 'typeorm';
import {User} from './entity/Users.entity';
import {GameService} from '../game/game.service';
import {ModuleRef} from '@nestjs/core';
import {
  ChannelInvite,
  UserCredentials,
  UserFriend,
  UserFriendsData,
  UserInfo,
  UserSettings
} from '../type/user.type';
import {JwtService} from '@nestjs/jwt';
import {apiBaseURL} from '../utils/constant';
import {TokenData} from '../type/jwt.type';
import {TypeConverters} from "../utils/type-converters";
import {failure, Result, success} from "../utils/Error";
import {APIError} from "../utils/errors";
import {TypeCheckers} from "../utils/type-checkers";
import {ChannelService} from "../channel/channel.service";

@Injectable()
export class UserService implements OnModuleInit {
  private gameService: GameService;
  private jwtService: JwtService;
  private channelService: ChannelService;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
    this.channelService = this.moduleRef.get(ChannelService, { strict: false });
  }

  async findByLogin(nickname: string)
    : Promise<Result<User, typeof APIError.UserNotFound>>
  {
    const result = await this.usersRepository.findOneBy({nickname: nickname });
    return result !== null ? success(result) : failure(APIError.UserNotFound);
  }

  async findByUsername(nickname: string)
    : Promise<User | null>
  {
    const result = await this.usersRepository.findOneBy({nickname: nickname });
    return result;
  }

  async findByID(id: number)
    : Promise<Result<User, typeof APIError.UserNotFound>>
  {
    const result = await this.usersRepository.findOneBy({ id: id });
    return result !== null ? success(result) : failure(APIError.UserNotFound);
  }

  async findByEmail(email: string)
    : Promise<Result<User, typeof APIError.UserNotFound>>
  {
    const result = await this.usersRepository.findOneBy({ email: email });
    return result !== null ? success(result) : failure(APIError.UserNotFound);
  }

  async findUserAndGetCredential(email: string)
    : Promise<Result<UserCredentials, typeof APIError.UserNotFound>>
  {
    const result = await this.usersRepository.findOne({
      where: { email: email },
      select: ['id', 'nickname', 'email', 'password', 'IsIntra', "isVerified"],
    });
    return result !== null ? success(TypeConverters.fromUserToUserCredentials(result)) : failure(APIError.UserNotFound);
  }

  async findAll()
    : Promise<User[]>
  {
    const result = await this.usersRepository.find();
    return result !== null ? result : [];
  }

  async getUserEmail(id: number)
    : Promise<Result<string, typeof APIError.UserNotFound>>
  {
    const result = await this.usersRepository.findOne({
      where: { id: id },
      select: ['id', 'email'],
    });
    return result !== null ? success(result.email) : failure(APIError.UserNotFound);
  }

  async userSettings(payload: TokenData)
    : Promise<Result<UserSettings, typeof APIError.UserNotFound>>
  {
    const user: User | null = await this.usersRepository.findOne({
      where: {id: payload.id},
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        email: true,
        firstname: true,
        lastname: true,
        authActivated: true,
      },
    });
    if (!user) return failure(APIError.UserNotFound);
    return success(TypeConverters.fromUserToUserSettings(user));
  }

  async userInfo(username: string)
    : Promise<Result<UserInfo, typeof APIError.UserNotFound>>
  {
    const user: User | null = await this.usersRepository.findOne({
      select: {
        id: true,
        nickname: true,
        level: true,
        ranking: true,
        avatarUrl: true,
        totalGameWon: true,
        xp: true,
        games: true,
        friendsId: true,
        requestedId: true,
        blockedId: true,
        blockedById: true,
        paddleColor: true,
        joinChannel: true,
      },
      where: {
        nickname: username,
      },
    });

    if (!user) return failure(APIError.UserNotFound);
    user.games = await this.gameService.fetchUserGames(user);

    return success(TypeConverters.fromUserToUserInfo(user));
  }

  async userInfoByID(id: number)
    : Promise<Result<UserInfo, typeof APIError.UserNotFound>>
  {
    const user: User | null = await this.usersRepository.findOne({
      select: {
        id: true,
        nickname: true,
        level: true,
        ranking: true,
        avatarUrl: true,
        totalGameWon: true,
        xp: true,
        games: true,
        friendsId: true,
        requestedId: true,
        blockedId: true,
        blockedById: true,
        paddleColor: true,
        joinChannel: true,
      },
      where: {
        id: id,
      },
    });

    if (!user) return failure(APIError.UserNotFound);
    user.games = await this.gameService.fetchUserGames(user);

    return success(TypeConverters.fromUserToUserInfo(user));
  }

  async leaderboard()
    : Promise<UserInfo[]>
  {
    const users: User[] | null = await this.usersRepository.find({
      order: {ranking: 'DESC'},
      take: 10,
      select: {
        id: true,
        nickname: true,
        ranking: true,
        avatarUrl: true,
        totalGameWon: true,
      },
      relations: {
        games: true,
      },
      where: {
        games: MoreThan(0),
      },
    });

    if (!users)
      return[];

    return users.map((user) => {
      return TypeConverters.fromUserToUserInfo(user);
    });
  }

  async isVerified(email: string)
    : Promise<Result<boolean, typeof APIError.UserNotFound>>
  {
   const result: User | null = await this.usersRepository.findOneBy({ email: email });
    return result !== null ? success(result.isVerified) : failure(APIError.UserNotFound);
  }

  async authActivated(email: string)
    : Promise<Result<boolean, typeof APIError.UserNotFound>>
  {
    const result: User | null = await this.usersRepository.findOneBy({email: email });
    return result !== null ? success(result.authActivated) : failure(APIError.UserNotFound);
  }

  async updateUserVerifiedStatus(id: number)
    : Promise<Result<true, typeof APIError.UserNotFound>>
  {
    const user = await this.usersRepository.findOneBy({id: id});
    if (!user)
      return failure(APIError.UserNotFound);

    user.isVerified = true;
    user.online = true;
    await this.usersRepository.save(user);
    return success(true);
  }

  async updateUser2FAstatus(token: string)
    : Promise<Result<true, typeof APIError.UserNotFound>>
  {
    const result = await this.getUserFromToken(token);
    if (result.isErr())
      return failure(APIError.UserNotFound);

    result.value.authActivated = !result.value.authActivated;
    await this.usersRepository.save(result.value);
    return success(true);
  }

  async changeOnlineStatus(id: number, state: boolean)
    : Promise<Result<true, typeof APIError.UserNotFound>>
  {
    const user = await this.usersRepository.findOneBy({id: id});
    if (!user)
      return failure(APIError.UserNotFound);

    user.online = state;
    await this.usersRepository.save(user);
    return success(true);
  }

  async requestFriend(friendId: number, myId: number)
    : Promise<Result<true, APIError.UserNotFound | typeof APIError.OtherUserNotFound>>
  {
    const me: User | null = await this.usersRepository.findOne({
      where: { id: myId },
      select: {
        id: true,
        requestedId: true,
      },
    });
    if (!me)
      return failure(APIError.UserNotFound);

    const friend: User | null = await this.usersRepository.findOne({
      where: { id: friendId },
      select: {
        id: true,
        requestedId: true,
      },
    });
    if (!friend)
      return failure(APIError.OtherUserNotFound);

    // If the friend has already a request from me, return
    if (friend.requestedId.includes(me.id))
      return success(true);

    // Add friend to my requested list
    friend.requestedId.push(me.id);

    // Update the friend's requests field in the database
    await this.usersRepository.save(friend);
    await this.channelService.sendNotificationEvent(friendId);
    return success(true);
  }

  async getFriendsListStatus(id: number)
    : Promise<Result<UserFriend[], typeof APIError.UserNotFound>>
  {
    const user: User | null = await this.usersRepository.findOneBy({ id: id });
    if (!user)
      return failure(APIError.UserNotFound);

    const friendsStatus: UserFriend[] = [];

    for (const friendId of user.friendsId) {
      const friend: User | null = await this.usersRepository.findOne({
        select: ['nickname', 'avatarUrl', 'online', 'inGame', 'id'],
        where: { id: friendId },
      });

      if (!friend) {
        // Remove the friend from the requested list
        user.requestedId = user.requestedId.filter((id) => id !== friendId);
        await this.usersRepository.save(user);
        continue;
      }

      friendsStatus.push(TypeConverters.fromUserToUserFriend(friend));
    }
    return success(friendsStatus);
  }

  async removeFriend(friendId: number, myId: number)
    : Promise<Result<UserFriendsData, typeof APIError.UserNotFound | typeof APIError.OtherUserNotFound>>
  {
    const me: User | null = await this.usersRepository.findOneBy({id: myId });
    if (!me)
      return failure(APIError.UserNotFound);

    const friend: User | null = await this.usersRepository.findOneBy({ id: friendId });
    if (!friend)
      return failure(APIError.OtherUserNotFound);


    for (let i = 0; i < me.friendsId.length; i++) {
      if (me.friendsId[i] === friend.id) {
        // Create a new array without the friend and update the database
        me.friendsId.splice(i, 1);
        const updated_me = await this.usersRepository.save(me);

        // Remove me from the friend's friends list
        for (let j = 0; j < friend.friendsId.length; j++) {
          if (friend.friendsId[j] === me.id) {
            // Create a new array without me and update the database
            friend.friendsId.splice(j, 1);
            await this.usersRepository.save(friend);

            // Both users are not friends anymore
            return success(TypeConverters.fromUserToUserFriendsData(updated_me));
          }
        }

        // The friend does not have me in his friends list
        return  success(TypeConverters.fromUserToUserFriendsData(updated_me));
      }
    }

    // I do not have the friend in my friends list
    return success(TypeConverters.fromUserToUserFriendsData(me));
  }

  async blockFriend(friendUsername: string, myId: number)
    : Promise<Result<UserFriendsData, typeof APIError.UserNotFound | typeof APIError.OtherUserNotFound>>
  {
    const friend: User | null = await this.usersRepository.findOne({where: { nickname: friendUsername } });
    if (!friend)
      return failure(APIError.UserNotFound);
    const result = await this.removeFriend(friend.id, myId);
    if (result.isErr() && (result.error === APIError.UserNotFound || result.error === APIError.OtherUserNotFound))
      return failure(result.error);

    const me: User | null = await this.usersRepository.findOne({
      where: { id: myId },
      select: {
        id: true,
        blockedId: true,
        blockedChat: true,
      },
    });
    if (!me)
      return failure(APIError.UserNotFound);

    // Add friend to my blocked list
    me.blockedId.push(friend.id);
    me.blockedChat.push(friend.nickname);

    // Add me to friend's blocked list
    friend.blockedById.push(me.id);
    friend.blockedChat.push(me.nickname);

    // Update the friend's blocked list in the database
    await this.usersRepository.save(friend);

    // Update my blocked list in the database
    const updated_me = await this.usersRepository.save(me);

    // Both users are blocked
    return success(TypeConverters.fromUserToUserFriendsData(updated_me));
  }

  async unblockFriend(friendUsername: string, myId: number)
    : Promise<Result<UserFriendsData, typeof APIError.UserNotFound | typeof APIError.OtherUserNotFound>>
  {
    const me: User | null = await this.usersRepository.findOne({
      where: { id: myId },
      select: {
        id: true,
        blockedId: true,
        blockedChat: true,
      },
    });
    if (!me)
      return failure(APIError.UserNotFound);

    const friend: User | null = await this.usersRepository.findOne({
      where: { nickname: friendUsername },
      select: {
        id: true,
        blockedById: true,
        blockedChat: true,
      },
    });
    if (!friend)
      return failure(APIError.OtherUserNotFound);

    for (let i = 0; i < me.blockedId.length; i++) {
      if (me.blockedId[i] === friend.id)
        me.blockedId.splice(i, 1);
    }

    for (let i = 0; i < friend.blockedById.length; i++) {
      if (friend.blockedById[i] === me.id)
        friend.blockedById.splice(i, 1);
    }

    for (let i = 0; i < me.blockedChat.length; i++) {
      if (me.blockedChat[i] === friend.nickname)
        me.blockedChat.splice(i, 1);
    }

    for (let i = 0; i < friend.blockedChat.length; i++) {
      if (friend.blockedChat[i] === me.nickname)
        friend.blockedChat.splice(i, 1);
    }

    // Update the friend's blocked list in the database
    await this.usersRepository.save(friend);

    // Update my blocked list in the database
    const updated_me = await this.usersRepository.save(me);

    // Both user are unblocked
    return success(TypeConverters.fromUserToUserFriendsData(updated_me));
  }

  async requests(id: number)
    : Promise<Result<UserFriend[], typeof APIError.UserNotFound>>
  {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: id },
      select: {
        id: true,
        requestedId: true,
      },
    });
    if (!user)
      return failure(APIError.UserNotFound);

    const friendRequests: UserFriend[] = [];
    for (const requestedId of user.requestedId) {
      const friend: User | null = await this.usersRepository.findOne({
        select: ['nickname', 'avatarUrl', 'online', 'inGame', 'id'],
        where: { id: requestedId },
      });
      if (!friend) {
        // Remove the friend from the requested list
        user.requestedId = user.requestedId.filter((id) => id !== requestedId);
        await this.usersRepository.save(user);
        continue;
      }

      friendRequests.push(TypeConverters.fromUserToUserFriend(friend));
    }
    return success(friendRequests);
  }

  async acceptFriendRequest(idFriend: number, myId: number)
    : Promise<Result<UserFriendsData, typeof APIError.UserNotFound | typeof APIError.OtherUserNotFound
    | typeof APIError.FriendRequestNotFound>>
  {
    const me: User | null = await this.usersRepository.findOne({
      where: { id: myId },
      select: {
        id: true,
        requestedId: true,
        friendsId: true,
      },
    });
    if (!me)
      return failure(APIError.UserNotFound);

    const friend = await this.usersRepository.findOneBy({ id: idFriend });
    if (!friend)
      return failure(APIError.OtherUserNotFound);

    for (let i = 0; i < me.requestedId.length; i++) {
      if (me.requestedId[i] === friend.id) {
        me.requestedId.splice(i, 1);
        me.friendsId.push(friend.id);
        friend.friendsId.push(me.id);

        await this.usersRepository.save(friend);
        const updated_me = await this.usersRepository.save(me);
        return success(TypeConverters.fromUserToUserFriendsData(updated_me));
      }
    }

    return failure(APIError.FriendRequestNotFound);
  }

  async declineFriendRequest(idFriend: number, myId: number)
    : Promise<Result<UserFriendsData, typeof APIError.UserNotFound | typeof APIError.OtherUserNotFound
    | typeof APIError.FriendRequestNotFound>>
  {
    const me: User | null = await this.usersRepository.findOne({
      where: { id: myId },
      select: {
        id: true,
        requestedId: true,
      },
    });
    if (!me)
      return failure(APIError.UserNotFound);

    const friend: User | null = await this.usersRepository.findOneBy({ id: idFriend });
    if (!friend)
      return failure(APIError.OtherUserNotFound);

    for (let i = 0; i < me.requestedId.length; i++) {
      if (me.requestedId[i] === friend.id) {
        me.requestedId.splice(i, 1);
        const updated_me = await this.usersRepository.save(me);
        return success(updated_me);
      }
    }

    return failure(APIError.FriendRequestNotFound);
  }

  async getBlockedList(myId: number)
    : Promise<Result<string[], typeof APIError.UserNotFound>>
  {
    const me: User | null = await this.usersRepository.findOneBy({ id: myId });
    if (!me)
      return failure(APIError.UserNotFound);

    let blockedUsernames: string[] = [];
    for (const otherId of me.blockedId) {
      const user: User | null = await this.usersRepository.findOne({
        where: { id: otherId },
        select: ['id', 'nickname'],
      });
      if (!user) {
        me.blockedId = me.blockedId.filter((id) => id !== otherId);
        await this.usersRepository.save(me);
        continue;
      }

      blockedUsernames.push(user.nickname);
    }

    return success(blockedUsernames);
  }

  async hasNotifs(myId: number)
    : Promise<Result<boolean, typeof APIError.UserNotFound>>
  {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: myId },
      select: {
        id: true,
        requestedId: true,
        invites: true,
        joinChannel: true,
      },
    });
    if (!user)
      return failure(APIError.UserNotFound);

    if (user.joinChannel.length > 0 || user.requestedId.length > 0 || user.invites.length > 0)
      return success(true);
    return success(false);
  }

  async updateAvatar(path: string, token: string)
    : Promise<Result<string, typeof APIError.UserNotFound | typeof APIError.InvalidToken>>
  {
    const user = await this.getUserFromToken(token);
    if (user.isErr())
      return failure(user.error);

    user.value.avatarUrl = apiBaseURL + path;
    await this.usersRepository.save(user.value);

    return success(user.value.avatarUrl);
  }

  async updateUserSettings(body: UserSettings, token: string)
    : Promise<Result<UserSettings, typeof APIError.InvalidNickname | typeof APIError.NicknameAlreadyTaken
    | typeof APIError.UserNotFound | typeof APIError.InvalidToken>>
  {
    if (body.nickname.length == 0 || body.nickname.length > 15)
      return failure(APIError.InvalidNickname);

    const result = await this.getUserFromToken(token);
    if (result.isErr())
      return failure(result.error);

    const user = result.value;
    if (user.nickname !== body.nickname) {
      const otherUser = await this.findByLogin(body.nickname);
      if (otherUser.isOk())
        return failure(APIError.NicknameAlreadyTaken);

      user.nickname = body.nickname;
      await this.channelService.updateNickname(body, token);
    }

    user.firstname = body.firstname;
    user.lastname = body.lastname;
    await this.usersRepository.save(user);
    return success(TypeConverters.fromUserToUserSettings(user));
  }

  async getUserFromToken(token: string)
    : Promise<Result<User, typeof APIError.UserNotFound | typeof APIError.InvalidToken>>
  {
    const decoded= this.jwtService.decode(token);
    if (!TypeCheckers.isTokenData(decoded))
      return failure(APIError.InvalidToken);

    const user = await this.usersRepository.findOneBy({ id: decoded.id });
    return user !== null ? success(user) : failure(APIError.UserNotFound);
  }

  async getFriendData(id: number)
    : Promise<Result<UserFriendsData, typeof APIError.UserNotFound>>
  {
    const result: User | null = await this.usersRepository.findOne({
      where: { id: id },
      select: {
        id: true,
        friendsId: true,
        requestedId: true,
        blockedId: true,
        blockedById: true,
      },
    });

    return result !== null ? success(TypeConverters.fromUserToUserFriendsData(result)) : failure(APIError.UserNotFound);
  }

  async addInvite(channel: string, id: number)
    : Promise<Result<User, typeof APIError.UserNotFound | typeof APIError.UserAlreadyInvitedToChannel>>
  {
    const user: User | null = await this.usersRepository.findOneBy({ id: id });
    if (user) {
      if (user.invites.includes(channel))
        return failure(APIError.UserAlreadyInvitedToChannel);

      user.invites.push(channel);
      return success(await this.usersRepository.save(user));
    }
    return failure(APIError.UserNotFound);
  }

  async updatePaddleColor(id: number, color: string)
    : Promise<Result<true, typeof APIError.InvalidColor | typeof APIError.UserNotFound>>
  {
    if (!color.match(/^[0-9A-F]{6}$/i)) {
      return failure(APIError.InvalidColor);
    }

    const user = await this.usersRepository.findOneBy({id: id});
    if (!user)
      return failure(APIError.UserNotFound);

    user.paddleColor = color;
    await this.usersRepository.save(user);

    return success(true);
  }

  async updateBackgroundColor(id: number, color: string)
    : Promise<Result<true, typeof APIError.InvalidColor | typeof APIError.UserNotFound>>
  {
    if (color !== "Normal" && color !== "Grass" && color !== "Dirt") {
      return failure(APIError.InvalidColor);
    }

    const user = await this.usersRepository.findOneBy({id: id});
    if (!user)
      return failure(APIError.UserNotFound);

    user.backgroundColor = color;
    await this.usersRepository.save(user);

    return success(true);
  }

  async getPaddleColor(id: number)
    : Promise<Result<string, typeof APIError.UserNotFound>>
  {
    const user = await this.usersRepository.findOneBy({ id: id });
    return user !== null ? success(user.paddleColor) : failure(APIError.UserNotFound);
  }

  async getBackgroundColor(id: number)
    : Promise<Result<string, typeof APIError.UserNotFound>>
  {
    const user = await this.usersRepository.findOneBy({ id: id });
    return user !== null ? success(user.backgroundColor) : failure(APIError.UserNotFound);
  }

  async fetchInvChannel(id : number)
    : Promise<Result<ChannelInvite[], typeof APIError.UserNotFound>>
  {
    const user = await this.usersRepository.findOneBy({id :Number(id)});
    if (!user)
      return failure(APIError.UserNotFound);

    const result: ChannelInvite[] = [];
    for (let i = 0; user.invitesId[i]; i++) {
      const sender = await this.usersRepository.findOne({
        select: ['nickname', 'avatarUrl', 'id'],
        where: { id: user.invitesId[i] },
      });
      if (!sender)
        continue;

      const temp: ChannelInvite = {
        joinChannel: user.joinChannel[i],
        invitedByAvatar: sender.avatarUrl,
        invitedByUsername: sender.nickname,
      };

      result.push(temp);
    }
    return success(result);
  }

  async updateUserGameStatus(user: User) {
    user.inGame = false;
    await this.usersRepository.save(user);
  }

  async fetchAllMyChannels(id: number) {
    const channels = await this.usersRepository.findOne({where: {id: id}});
    if (channels)
      return channels.chans;
    return null;
  }
}
