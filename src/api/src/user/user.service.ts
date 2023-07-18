import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { UserInfo, UserSettings } from '../type/user.type';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { apiBaseURL } from '../utils/constant';
import { TokenData } from '../type/jwt.type';

@Injectable()
export class UserService implements OnModuleInit {
  private gameService: GameService;
  private jwtService: JwtService;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
  }

  async findByLogin(nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nickname: nickname } });
  }

  async findByID(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email } });
  }

  async findUserAndGetCredential(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email },
      select: ['id', 'nickname', 'email', 'password', 'IsIntra'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserEmail(id: number) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: id },
      select: ['id', 'email'],
    });
    if (!user) throw new BadRequestException('User does not exist');
    return user;
  }

  async userSettings(token: string): Promise<User | null> {
    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    return this.usersRepository.findOne({
      where: { id: decoded.id },
      select: [
        'id',
        'nickname',
        'avatarUrl',
        'email',
        'firstname',
        'lastname',
        'authActivated',
      ],
    });
  }

  async userInfo(token: string, username: string): Promise<UserInfo | any> {
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
        websocket: true,
      },
      where: {
        nickname: username,
      },
    });

    if (!user) throw new BadRequestException('User does not exist');
    user.games = await this.gameService.fetchUserGames(user);
    return user;
  }

  async leaderboard(): Promise<UserInfo[] | any> {
    return this.usersRepository.find({
      order: { ranking: 'DESC' },
      take: 10,
      select: {
        id: true,
        nickname: true,
        ranking: true,
        avatarUrl: true,
        totalGameWon: true,
        websocket: true,
      },
      relations: {
        games: true,
      },
      where: {
        games: MoreThan(0),
      },
    });
  }

  async isVerified(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email, isVerified: true },
    });
  }

  async authActivated(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email, authActivated: true },
    });
  }

  async updateUserVerifiedStatus(id: number) {
    await this.usersRepository.update(id, {
      isVerified: true,
      online: true,
    });
  }

  async update2FA(token: string) {
    const user = await this.decodeToken(token);
    if (!user) throw new ForbiddenException('Invalid token');

    return await this.usersRepository.update(user.id, {
      authActivated: !user.authActivated,
    });
  }

  async changeOnlineStatus(id: number, state: boolean) {
    await this.usersRepository.update(id, { online: state });
  }

  async requestFriend(friendId: number, myId: number) {
    const friend: any = await this.usersRepository.findOne({
      where: { id: myId },
    });
    const user: any = await this.usersRepository.findOne({
      where: { id: friendId },
    });
    if (user.requestedId) {
      for (let i = 0; user.requestedId[i]; i++) {
        if (
          user.requestedId[i] === friend.id ||
          user.friendsId[i] === friend.id
        )
          return;
      }
    }
    user.requestedId.push(friend.id);
    await this.usersRepository.save(user);
  }

  async getOnlineFriendsList(id: number) {
    const user: any = await this.usersRepository.findOne({ where: { id: id } });
    if (user && user.friendsId) {
      const friends: User[] = [];
      for (let i = 0; user.friendsId[i]; i++) {
        const friend: any = await this.usersRepository.findOne({
          select: ['nickname', 'avatarUrl', 'online', 'inGame', 'id'],
          where: { id: user.friendsId[i] },
        });
        if (friend.online === true) friends.push(friend);
      }
      return friends;
    }
    return null;
  }

  async getOfflineFriendsList(id: number) {
    const user: any = await this.usersRepository.findOne({ where: { id: id } });
    if (user && user.friendsId) {
      const friends: User[] = [];
      for (let i = 0; user.friendsId[i]; i++) {
        const friend: any = await this.usersRepository.findOne({
          select: ['nickname', 'avatarUrl', 'online', 'inGame', 'id'],
          where: { id: user.friendsId[i] },
        });
        if (friend.online === false) friends.push(friend);
      }
      return friends;
    }
    return null;
  }

  async removeFriend(friendId: number, myId: number) {
    const me: any = await this.usersRepository.findOne({ where: { id: myId } });
    const friend: any = await this.usersRepository.findOne({
      where: { id: friendId },
    });
    if (me.friendsId) {
      for (let i = 0; me.friendsId[i]; i++) {
        if (me.friendsId[i] === friend.id) {
          const newFriends: number[] = me.friendsId.splice(i, 1);
          await this.usersRepository.update(me.id, { friendsId: newFriends });
          await this.usersRepository.save(me);
          if (friend.friendsId) {
            for (let i = 0; friend.friendsId[i]; i++) {
              if (friend.friendsId[i] === me.id) {
                const newFriends: number[] = friend.friendsId.splice(i, 1);
                await this.usersRepository.update(friend.id, {
                  friendsId: newFriends,
                });
                return await this.usersRepository.save(friend);
              }
            }
          }
        }
      }
    }
    return null;
  }

  async blockFriend(friendId: number, myId: number) {
    await this.removeFriend(friendId, myId);
    const me: any = await this.usersRepository.findOne({ where: { id: myId } });
    const friend: any = await this.usersRepository.findOne({
      where: { id: friendId },
    });
    me.blockedId.push(friend.id);
    me.blockedChat.push(friend.nickname);
    friend.blockedById.push(me.id);
    friend.blockedChat.push(me.nickname);
    await this.usersRepository.save(friend);
    return await this.usersRepository.save(me);
  }

  async blockFriendUsr(friendName: string, myId: number) {
    const me: any = await this.usersRepository.findOne({ where: { id: myId } });
    const friend: any = await this.usersRepository.findOne({
      where: { nickname: friendName },
    });
    me.blockedId.push(friend.id);
    friend.blockedById.push(me.id);
    me.blockedChat.push(friend.nickname);
    friend.blockedChat.push(me.nickname);
    await this.usersRepository.save(friend);
    return await this.usersRepository.save(me);
  }

  async unblockFriend(friendId: number, myId: number) {
    const me: any = await this.usersRepository.findOne({ where: { id: myId } });
    const friend: any = await this.usersRepository.findOne({
      where: { id: friendId },
    });
    if (me.blockedId) {
      for (let i = 0; me.blockedId[i]; i++) {
        if (me.blockedId[i] === friend.id) {
          const newBlocked: number[] = me.blockedId.splice(i, 1);
          await this.usersRepository.update(me.id, { blockedId: newBlocked });
          await this.usersRepository.save(me);
        }
      }
    }
    if (friend.blockedById) {
      for (let i = 0; friend.blockedById[i]; i++) {
        if (friend.blockedById[i] === me.id) {
          const newBlockedBy: number[] = friend.blockedById.splice(i, 1);
          await this.usersRepository.update(friend.id, {
            blockedById: newBlockedBy,
          });
          await this.usersRepository.save(friend);
        }
      }
    }
    if (me.blockedChat) {
      for (let i = 0; me.blockedChat[i]; i++) {
        if (me.blockedChat[i] === friend.nickname) {
          const newBlockedChatMe: string[] = me.blockedChat.splice(i, 1);
          await this.usersRepository.update(me.id, { blockedChat: newBlockedChatMe });
          await this.usersRepository.save(me);
        }
      }
    }
    if (friend.blockedChat) {
      for (let i = 0; friend.blockedChat[i]; i++) {
        if (friend.blockedChat[i] === me.nickname) {
          const newBlockedChat: string[] = friend.blockedChat.splice(i, 1);
          await this.usersRepository.update(friend.id, {
            blockedChat: newBlockedChat,
          });
          return await this.usersRepository.save(friend);
        }
      }
    }
    return null;
  }

  async requests(id: number) {
    const user: any = await this.usersRepository.findOne({ where: { id: id } });
    if (user && user.friendsId) {
      const friends: User[] = [];
      for (let i = 0; user.requestedId[i]; i++) {
        const friend: any = await this.usersRepository.findOne({
          select: ['nickname', 'avatarUrl', 'id'],
          where: { id: user.requestedId[i] },
        });
        friends.push(friend);
      }
      console.log(friends);
      return friends;
    }
    return null;
  }

  async acceptFriendRequest(idFriend: number, myId: any) {
    const me: any = await this.usersRepository.findOne({ where: { id: myId } });
    const friend: any = await this.usersRepository.findOne({
      where: { id: idFriend },
    });
    if (me.requestedId) {
      for (let i = 0; me.requestedId[i]; i++) {
        if (me.requestedId[i] === friend.id) {
          const newRequested: number[] = me.requestedId.splice(i, 1);
          await this.usersRepository.update(me.id, {
            requestedId: newRequested,
          });
          me.friendsId.push(friend.id);
          friend.friendsId.push(me.id);
          await this.usersRepository.save(friend);
          return await this.usersRepository.save(me);
        }
      }
    }
    return null;
  }

  async declineFriendRequest(idFriend: number, myId: any) {
    const me: any = await this.usersRepository.findOne({ where: { id: myId } });
    const friend: any = await this.usersRepository.findOne({
      where: { id: idFriend },
    });
    if (me.requestedId) {
      for (let i = 0; me.requestedId[i]; i++) {
        if (me.requestedId[i] === friend.id) {
          const newRequested: number[] = me.requestedId.splice(i, 1);
          await this.usersRepository.update(me.id, {
            requestedId: newRequested,
          });
          return await this.usersRepository.save(me);
        }
      }
    }
    return null;
  }

  async getBlockedList(myId: number) {
    const me: any = await this.usersRepository.findOne({where: {id: myId}});
    return me.blockedChat;
  }

  async addWebSocket(nickname: string, socket: string) {
    const user: any = await this.usersRepository.findOne({
      where: { nickname: nickname },
    });
    if (user) await this.usersRepository.update(user.id, { websocket: socket });
  }

  async getNotifs(myId: number) {
    const user: any = await this.usersRepository.findOne({
      where: { id: myId },
    });
    if (user && user.requestedId && user.requestedId[0]) return true;
    return null;
  }

  async updateAvatar(path: string, token: string) {
    const user = await this.decodeToken(token);
    if (!user) return null;

    user.avatarUrl = apiBaseURL + path;
    await this.usersRepository.save(user);

    return user.avatarUrl;
  }

  async updateUserSettings(body: UserSettings, token: string) {
    const user = await this.decodeToken(token);
    if (!user) return null;

    if (user.nickname !== body.nickname) {
      const checkNickname = await this.findByLogin(body.nickname);
      if (checkNickname) {
        throw new BadRequestException('Nickname already taken');
      }
      user.nickname = body.nickname;
    }

    user.firstname = body.firstname;
    user.lastname = body.lastname;
    await this.usersRepository.save(user);
    return user;
  }

  async decodeToken(token: string): Promise<User | null> {
    if (!token) throw new ForbiddenException('Invalid token');

    const decoded: TokenData = this.jwtService.decode(token) as TokenData;
    const user = await this.usersRepository.findOne({
      where: { id: decoded.id },
    });
    if (!user) return null;
    return user;
  }
}
