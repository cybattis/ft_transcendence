import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entity/Users.entity';
import { GameService } from '../game/game.service';
import { ModuleRef } from '@nestjs/core';
import { UserInfo } from '../type/user.type';

@Injectable()
export class UserService implements OnModuleInit {
  private gameService: GameService;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
  }

  async findByLogin(nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nickname: nickname } });
  }

  async findByID(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: id } });
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

  async userInfo(id: number): Promise<UserInfo | any> {
    const user = await this.findByID(id);
    if (!user) return null;

    return {
      id: user.id,
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      ranking: user.ranking,
      avatarUrl: user.avatarUrl,
      games: await this.gameService.findUserGames(id),
      totalGameWon: user.totalGameWon,
      friendsId: user.friendsId,
      requestedId: user.requestedId,
      websocket: user.websocket,

      // Channel list ?
      // Achievements ?
    };
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

  async updateValidation(id: number) {
    await this.usersRepository.update(id, {
      isVerified: true,
      online: true,
    });
  }

  async updateAuth(id: number) {
    await this.usersRepository.update(id, {
      authActivated: true,
    });
  }

  async changeOnlineStatus(id: number, state: boolean) {
    await this.usersRepository.update(id, { online: state });
  }

  async requestFriend(friendId: number, myId: number) {
    const friend: any = await this.usersRepository.findOne({where : {id: myId}});
    const user: any = await this.usersRepository.findOne({where : {id: friendId}});
    if (user.requestedId)
    {
      for (let i = 0; user.requestedId[i]; i ++)
      {
        if (((user.requestedId[i] === friend.id) === true) || ((user.friendsId[i] === friend.id) === true))
          return ;
      }
    }
    user.requestedId.push(friend.id);
    await this.usersRepository.save(user);
  }

  async getOnlineFriendsList(id: number) {
    const user: any = await this.usersRepository.findOne({where : {id: id}});
    if (user && user.friendsId)
    {
      let friends: User[] = [];
      for (let i = 0; user.friendsId[i]; i ++)
      {
          let friend: any = await this.usersRepository.findOne({
            select: ['nickname', 'avatarUrl', 'online', 'inGame', 'id'],
            where : {id: user.friendsId[i]}});
          if (friend.online === true)
            friends.push(friend);
      }
      return (friends);
    }
    return null;
  }

  async getOfflineFriendsList(id: number) {
    const user: any = await this.usersRepository.findOne({where : {id: id}});
    if (user && user.friendsId)
    {
      let friends: User[] = [];
      for (let i = 0; user.friendsId[i]; i ++)
      {
        let friend: any = await this.usersRepository.findOne({
          select: ['nickname', 'avatarUrl', 'online', 'inGame', 'id'],
          where : {id: user.friendsId[i]}});
        if (friend.online === false)
          friends.push(friend);
      }
      return (friends);
    }
    return null;
  }

  async removeFriend(friendId: number, myId: number) {
    console.log("HERE");
    const me: any = await this.usersRepository.findOne({where : {id: myId}});
    const friend: any = await this.usersRepository.findOne({where : {id: friendId}});
    if (me.friendsId)
    {
      for (let i = 0; me.friendsId[i]; i ++)
      {
        if (me.friendsId[i] === friend.id)
        {
          const newFriends: number[] = me.friendsId.splice(i, 1);
          await this.usersRepository.update(me.id, {friendsId: newFriends});
          await this.usersRepository.save(me);
          if (friend.friendsId)
          {
            for (let i = 0; friend.friendsId[i]; i ++)
            {
              if (friend.friendsId[i] === me.id)
              {
                const newFriends: number[] = friend.friendsId.splice(i, 1);
                await this.usersRepository.update(friend.id, {friendsId: newFriends});
                return await this.usersRepository.save(friend);
              }
            }
          }
        }
      }
    }
    return null;
  }

  //Faire liste de bloques
  async blockFriend(friendId: number, myId: number) {
    const friend: any = await this.usersRepository.findOne({where : {id: myId}});
    const user: any = await this.usersRepository.findOne({where : {id: friendId}});
    if (user.requestedId)
    {
      for (let i = 0; user.requestedId[i]; i ++)
      {
        if ((user.requestedId[i] === friend.id) === true)
          return ;
      }
    }
    user.requestedId.push(friend.id);
    await this.usersRepository.save(user);
  }

  async requests(id: number) {
    const user: any = await this.usersRepository.findOne({where : {id: id}});
    if (user && user.friendsId)
    {
      let friends: User[] = [];
      for (let i = 0; user.requestedId[i]; i ++)
      {
        let friend: any = await this.usersRepository.findOne({
          select: ['nickname', 'avatarUrl', 'id'],
          where : {id: user.requestedId[i]}});
          friends.push(friend);
      }
      console.log(friends);
      return (friends);
    }
    return null;
  }

  async acceptFriendRequest(idFriend: number, myId: any) {
    const me: any = await this.usersRepository.findOne({where : {id: myId}});
    const friend: any = await this.usersRepository.findOne({where : {id: idFriend}});
    if (me.requestedId)
    {
      for (let i = 0; me.requestedId[i]; i ++)
      {
        if (me.requestedId[i] === friend.id)
        {
          const newRequested: number[] = me.requestedId.splice(i, 1);
          await this.usersRepository.update(me.id, {requestedId: newRequested});
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
    const me: any = await this.usersRepository.findOne({where : {id: myId}});
    const friend: any = await this.usersRepository.findOne({where : {id: idFriend}});
    if (me.requestedId)
    {
      for (let i = 0; me.requestedId[i]; i ++)
      {
        if (me.requestedId[i] === friend.id)
        {
          const newRequested: number[] = me.requestedId.splice(i, 1);
          await this.usersRepository.update(me.id, {requestedId: newRequested});
          return await this.usersRepository.save(me);
        }
      }
    }
    return null;
  }

  async addWebSocket(nickname: string, socket: string) {
    const user: any = await this.usersRepository.findOne({where : {nickname: nickname}});
    if (user)
      await this.usersRepository.update(user.id, {websocket: socket});
  }

  async getNotifs(myId: number) {
    const user: any = await this.usersRepository.findOne({where: {id: myId}});
    if (user.requestedId && user.requestedId[0])
      return true;
    return null;
  }
}