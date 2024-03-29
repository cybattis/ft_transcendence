import {BadRequestException, Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {BanType, ChannelStructure} from './channel.structure';
import {Server, Socket} from 'socket.io';
import * as bcrypt from 'bcrypt';
import {Chat} from './entity/Chat.entity';
import {Channel} from './entity/Channel.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserService} from 'src/user/user.service';
import {TokenData} from '../type/jwt.type';
import {JwtService} from '@nestjs/jwt';
import {ModuleRef} from '@nestjs/core';
import {UsersSocketStructure} from './usersSocket.structure';
import {User} from 'src/user/entity/Users.entity';
import {UserSettings} from 'src/type/user.type';
import {APIError} from "../utils/errors";
import {failure, Result, success} from "../utils/Error";
const limPwd = 50;
const limInput = 15;
const limMsg = 126;

@Injectable()
export class ChannelService implements OnModuleInit {
  private jwtService: JwtService;
  private userService: UserService;

  private server: Server;
  private readonly channelStruct: ChannelStructure[];
  private usersSocketList: UsersSocketStructure[];

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private moduleRef: ModuleRef,
  ) {
    this.channelStruct = [];
    this.usersSocketList = [];
  }

  async onModuleInit() {
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
    this.userService = this.moduleRef.get(UserService, { strict: false });
    const rowCount = await this.channelRepository.count();
    if (rowCount == 0)
      await this.channelRepository.save({
        channel: '#general',
        status: 'public',
        users: [],
        owner: '',
        operator: [],
        banName: [],
        ban: [],
        mute: [],
        muteTime: [],
        password: '',
      });
  }

  public setServer(server: Server): void {
    this.server = server;
  }

  listUsersChannel(channel: string) {
    for (let index = 0; index < this.channelStruct.length; index++) {
      if (channel === this.channelStruct[index].name) {
        return this.channelStruct[index].users;
      }
    }
    return null;
  }

  limiteInput(message: string, type: number){
    if (message === undefined ) return false;
    if (type === 0){
      if (message.length > limMsg)
        return false;
    }
    if (type === 1){
      if (message.length > limPwd)
        return false;
    }
    if (type === 2){
      if (message.length > limInput)
        return false; 
    }
    return true;
  }

  async quitChannel(cmd: string, username: string, channel: string) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(channel, 2)) return;

    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (this.checkUserIsHere(channelToUpdate.operator, username))
      await this.kickOp(channelToUpdate, username);
    if (this.checkUserIsHere(channelToUpdate.users, username))
      await this.kickUser(channelToUpdate, username);

    await this.deleteChannel(channelToUpdate);
    const user = await this.usersRepository.findOne({where: {nickname: username}});
    if (user)
    {
      for (let i = 0; user.chans[i]; i++) {
        if (user.chans[i] === channel) {
          const newChans: string[] = user.chans.splice(i, 1);
          await this.usersRepository.update(user.id, {
            chans: newChans,
          });
          return await this.usersRepository.save(user);
        }
      }
    }
  }

  async kickChannel(
    server: Server,
    cmd: string,
    username: string,
    target: string,
    channel: string,
  ) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(target, 2)) return;
    if (!this.limiteInput(channel, 2)) return;

    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return false;
    if (!this.checkUserIsHere(channelToUpdate.operator, username)) {
      return false;
    }
    if (!this.checkUserIsHere(channelToUpdate.users, target)) {
      return false;
    }
    if (cmd === 'kick') {
      await this.kickOp(channelToUpdate, target);
      await this.kickUser(channelToUpdate, target);
      const user = await this.usersRepository.findOne({where: {nickname: target}});
      if (user)
      {
        for (let i = 0; user.chans[i]; i++) {
          if (user.chans[i] === channel) {
            const newChans: string[] = user.chans.splice(i, 1);
            await this.usersRepository.update(user.id, {
              chans: newChans,
            });
            return await this.usersRepository.save(user);
          }
        }
      }
      return true;
    }
    return false;
  }

  async banChannel(
    cmd: string,
    username: string,
    target: string,
    channel: string,
    time: string,
  ) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(target, 2)) return;
    if (!this.limiteInput(channel, 2)) return;

    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (!this.checkUserIsHere(channelToUpdate.operator, username))
      return `Ban : ${username} isn't operator`;
    const timeBan: number = this.valideTime(time);
    if (cmd === '+b')
    {
      await this.actBan(channelToUpdate, target, timeBan);
      const user = await this.usersRepository.findOne({where: {nickname: target}});
      if (user)
      {
        for (let i = 0; user.chans[i]; i++) {
          if (user.chans[i] === channel) {
            const newChans: string[] = user.chans.splice(i, 1);
            await this.usersRepository.update(user.id, {
              chans: newChans,
            });
            return await this.usersRepository.save(user);
          }
        }
      }
    }
    await this.deleteChannel(channelToUpdate);
  }

  async unbanChannel(
    cmd: string,
    username: string,
    target: string,
    channel: string,
  ) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(target, 2)) return;
    if (!this.limiteInput(channel, 2)) return;

    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (!this.checkUserIsBanHere(channelToUpdate.ban, channelToUpdate.banName, target))
      return `Ban : ${username} isn't banned.`;
    if (cmd === '-b') await this.actUnban(channelToUpdate, target);
    await this.deleteChannel(channelToUpdate);
  }

  async actBan(channelToUpdate: Channel, target: string, time: number) {
    for (let index = 0; channelToUpdate.users[index]; index++) {
      if (channelToUpdate.users[index] === target)
        channelToUpdate.users.splice(index, 1);
    }
    for (let index = 0; channelToUpdate.operator[index]; index++) {
      if (channelToUpdate.operator[index] === target)
        channelToUpdate.operator.splice(index, 1);
    }
    for (let index = 0; channelToUpdate.ban[index]; index++) {
      if (channelToUpdate.ban[index][0] === target) return;
    }
    let date = new Date();
    if (time !== 0)
      date = new Date(date.getTime() + (time * 60000));
    const banType: BanType = [target, date];
    channelToUpdate.ban.push(banType);
    channelToUpdate.banName.push(target);
    await this.channelRepository.save(channelToUpdate);
  }

  async actUnban(channelToUpdate: Channel, target: string) {
    for (let index = 0; channelToUpdate.ban[index]; index++) {
      if (channelToUpdate.banName[index] === target)
        channelToUpdate.banName.splice(index, 1);
      if (channelToUpdate.ban[index][0] === target)
        channelToUpdate.ban.splice(index, 1);
    }
    await this.channelRepository.save(channelToUpdate);
  }

  async opChannel(
    server: Server,
    socket: Socket,
    channel: string,
    cmd: string,
    author: string,
    target: string,
  ) {
    if (!this.limiteInput(channel, 2)) return;
    if (!this.limiteInput(author, 2)) return;
    if (!this.limiteInput(target, 2)) return;

    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (!this.checkUserIsHere(channelToUpdate.operator, author)) {
      return;
    }
    if (cmd === '+o') {
      await this.addNewOp(channelToUpdate, target);
      const blockedUsers = await this.userService.findByLogin(author);
      if (blockedUsers.isErr())
        return;

      await this.channelAnnoucementOp(
        socket,
        this.server,
        channel,
        'op',
        author,
        blockedUsers.value.blockedChat,
        target,
      );
      const reason = "You are now operator.";
      await this.sendErr(server, channel, target, reason);
    } else if (cmd === '-o') {
      await this.kickOp(channelToUpdate, target);
      const blockedUsers = await this.userService.findByLogin(author);
      if (blockedUsers.isErr())
        return;

      await this.channelAnnoucementOp(
        socket,
        this.server,
        channel,
        'deop',
        author,
        blockedUsers.value.blockedChat,
        target,
      );
      const reason = "You are not an operator anymore.";
      await this.sendErr(server, channel, target, reason);
    }
  }

  isUsers(username: string, channel: string) {
    for (let index = 0; index < this.channelStruct.length; index++) {
      if (this.channelStruct[index].name === channel) {
        for (
          let indexUsers = 0;
          indexUsers < this.channelStruct[index].users.length;
          indexUsers++
        ) {
          if (this.channelStruct[index].users[indexUsers] === username)
            return true;
        }
      }
    }
    return false;
  }

  async addNewOp(channelToUpdate: Channel, target: string) {
    for (let index = 0; channelToUpdate.users[index]; index++) {
      if (channelToUpdate.users[index] === target) {
        for (let index = 0; channelToUpdate.operator[index]; index++) {
          if (channelToUpdate.operator[index] === target) return;
        }
        channelToUpdate.operator.push(target);
        await this.channelRepository.save(channelToUpdate);
      }
    }
  }

  async kickOp(channelToUpdate: Channel, target: string) {
    for (let index = 0; channelToUpdate.operator[index]; index++) {
      if (channelToUpdate.operator[index] === target) {
        if (channelToUpdate.operator.length == 1) channelToUpdate.operator = [];
        else channelToUpdate.operator.splice(index, 1);
      }
    }
    await this.channelRepository.save(channelToUpdate);
  }

  async kickUser(channelToUpdate: Channel, target: string) {
    for (let index = 0; channelToUpdate.users[index]; index++) {
      if (channelToUpdate.users[index] === target) {
        if (channelToUpdate.users.length == 1) channelToUpdate.users = [];
        else channelToUpdate.users.splice(index, 1);
      }
    }
    await this.channelRepository.save(channelToUpdate);
  }

  valideTime(time: string): number {
    let res = 0;
    let i = 0;
    if (time[0] == '-') {
      return 0;
    }
    for (; i < time.length; ++i) {
      if (time[i] > '0' && time[i] < '9')
        res = res * 10 + time[i].charCodeAt(0) - '0'.charCodeAt(0);
      else if (res > 30) return 30;
      else return res;
    }
    if (res > 30) return 30;
    return res;
  }

  async getSocketById(id: number): Promise<string | null> {
    const user = await this.userService.findByID(id);
    if (user.isErr()) return null;
    for (let index = 0; index < this.usersSocketList.length; index++) {
      if (id === this.usersSocketList[index].id)
        return this.usersSocketList[index].socket;
    }
    return null;
  }

  checkUserIsHere(liste: string[], username: string): boolean {
    for (let index = 0; index < liste.length; index++) {
      if (username === liste[index]) return true;
    }
    return false;
  }

  checkUserIsBanHere(liste: BanType[], otherList: string[], username: string): boolean {
    for (let index = 0; index < liste.length; index++) {
      if (username === liste[index][0] || username === otherList[index]) return true;
    }
    return false;
  }

  async tryJoin(
    server: Server,
    socket: Socket,
    type: string,
    username: string,
    channel: string,
    pass: string,
    blockedChat: string[],
  ): Promise<boolean> {
    const channelToJoin = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (!channelToJoin) return false;
    if (this.checkUserIsBanHere(channelToJoin.ban, channelToJoin.banName, username)) {
      for (let index = 0; index < channelToJoin.ban.length; index++){
        if (channelToJoin.ban[index][0] === username || channelToJoin.banName[index] === username){
          const date : Date = new Date();
          const comp : Date = new Date(channelToJoin.ban[index][1]);
          if (date.getTime() - comp.getTime() > 0){
            channelToJoin.ban = channelToJoin.ban.splice(index, 1);
            channelToJoin.banName = channelToJoin.banName.splice(index, 1);
            await this.channelRepository.save(channelToJoin);
            break;
          }
          else {
            const time = new Date(comp.getTime() - date.getTime());
            if (time.getMinutes() < 60)
            {
              const reason = time.getMinutes() < 1 ? 'You are ban for '+ time.getSeconds() + ' s.' : 'You are ban for '+ time.getMinutes() + ' min.';
              const err = { channel, reason };
              server.to(socket.id).emit('err', err);
              return false;
            }
            else
            {
              const reason = 'You are banned.';
              const err = { channel, reason };
              server.to(socket.id).emit('err', err);
              return false;
            }
          }
        }
      }
    }
    if (this.checkUserIsHere(channelToJoin.users, username)) {
      const reason = 'You are aleready present';
      const err = { channel, reason };
      server.to(socket.id).emit('err', err);
      return false;
    }
    if (channelToJoin.status === 'public') {
      channelToJoin.users.push(username);
      await this.channelRepository.save(channelToJoin);
      socket.join(channel);
      socket.emit('join', channel);
      const sender = 'announce';
      const msg =
        username + ' just joined the channel. Welcome him/her nicely.';
      const send = { sender, msg, channel, blockedChat };
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: sender,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
    } else if (channelToJoin.status === 'protected') {
      const reason = 'The channel is protected, you have to be invited.';
      const err = { channel, reason };
      server.to(socket.id).emit('err', err);
      return false; // Only invitation
    } else if (channelToJoin.status === 'private') {
      if (!(await bcrypt.compare(pass, channelToJoin.password))) {
        const reason = 'Bad password';
        const err = { channel, reason };
        server.to(socket.id).emit('err', err);
        return false; // bad mpd
      }
      channelToJoin.users.push(username);
      await this.channelRepository.save(channelToJoin);
      socket.join(channel);
      socket.emit('join', channel);
      const sender = 'announce';
      const msg =
        username + ' just joined the channel. Welcome him/her nicely.';
      const send = { sender, msg, channel, blockedChat };
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: sender,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
    }
    return true;
  }

  isValidChannel(channel : string){
    if (!(channel.length < limInput && channel.length > 1)) return false;
    for (let index = 1; index < channel.length; index++){
      if  (!(channel[index] >= 'a' && channel[index] <= 'z')
      && !(channel[index] >= 'A' && channel[index] <= 'Z')
      && !(channel[index] >= '0' && channel[index] <= '9')
      )
      return false;
    }
    return true;
  }

  isValidType(type: string){
    if (type === "protected" || type === "public" || type === "private")
      return true;
    return false
  }

  async joinChannel(
    server: Server,
    socket: Socket,
    type: string,
    username: string,
    channel: string,
    pass: string,
    blockedChat: string[],
  ) {
      if (!this.limiteInput(username, 2)) return;
      if (!this.limiteInput(channel, 2)) return;
      if (pass && !this.limiteInput(pass, 1)) return;
      if (channel !== "#general" && !this.isValidType(type)){
      const reason = "Invalid type channel";  
      const err = { channel, reason };
      server.to(socket.id).emit('err', err);
      return ;
    }
    if (!this.isValidChannel(channel)){
      const reason = "Invalid name channel";
      const err = { channel, reason };
      server.to(socket.id).emit('err', err);
      return ;
    } 
    if (channel === '#general') {
      const channelToUpdate = await this.channelRepository.findOne({
        where: { channel: channel },
      });
      if (!channelToUpdate) return;
      if (this.checkUserIsHere(channelToUpdate.users, username)) return;
      const user = await this.usersRepository.findOne({where: {nickname: username}});
      if (user)
      {
        if (user.chans.includes(channel))
          return ;
        user.chans.push(channel);
        await this.usersRepository.save(user);
      }
      channelToUpdate.users.push(username);
      await this.channelRepository.save(channelToUpdate);
      socket.emit('join', channel);
      socket.broadcast.emit('change-username', username);
    } else {
      const channelToJoin = await this.channelRepository.findOne({
        where: { channel: channel },
      });
      if (channelToJoin) {
        if (await this.tryJoin(
          server,
          socket,
          type,
          username,
          channel,
          pass,
          blockedChat,
        )){
          const user = await this.usersRepository.findOne({where: {nickname: username}});
          if (user)
          {
            if (user.chans.includes(channel)) return;
            user.chans.push(channel);
            await this.usersRepository.save(user);
          }
        }
      }
      else {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(pass, salt);
        await this.channelRepository.save({
          channel: channel,
          status: type,
          users: [username],
          owner: username,
          operator: [username],
          banName: [],
          ban: [],
          mute: [],
          muteTime: [],
          password: hash,
        });
        const user = await this.usersRepository.findOne({where: {nickname: username}});
        if (user)
        {
          user.chans.push(channel);
          await this.usersRepository.save(user);
        }
        socket.emit('join', channel);
        const sender = 'announce';
        const msg =
          username + ' just joined the channel. Welcome him/her nicely.';
        const send = { sender, msg, channel, blockedChat };
        await this.chatRepository.save({
          channel: channel,
          content: msg,
          emitter: sender,
          emitterId: 0,
        });
        socket.broadcast.emit('rcv', send);
      }
    }
  }

  async joinGameChannel(socket: Socket, canal: string) {
    socket.emit('join', canal);
  }

  async joinOldChannel(socket: Socket, username: string) {
    const allChannel: Channel[] = await this.channelRepository.find();
    if (allChannel) {
      for (let index = 0; allChannel[index]; index++) {
        if (this.checkUserIsHere(allChannel[index].users, username)) {
          socket.join(allChannel[index].channel);
          socket.emit('join', allChannel[index].channel);
        }
      }
    }
  }

  async sendPrvMess(
    server: Server,
    socket: Socket,
    username: string,
    target: string,
  ) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(target, 2)) return;
    const user = await this.usersRepository.findOne({where: {nickname: target}});
    if (!user)
    return ;
    const socketTarget = await this.getSocketById(user.id);
    const channel = username + target;
    const res: string | null = await this.findChannelPrivateMessage(
      username,
      target,
      );
    if (res) return;
    if (socketTarget) {
      await this.channelRepository.save({
        channel: channel,
        status: 'message',
        users: [username, target],
        owner: '',
        operator: [],
        ban: [],
        banName: [],
        mute: [],
        muteTime: [],
        password: '',
      });
      const me = await this.usersRepository.findOne({where: {nickname: username}})
      if (me)
      {
        me.chans.push(target);
        await this.usersRepository.save(me);
      }
      const friend = await this.usersRepository.findOne({where: {nickname: target}})
      if (friend)
      {
        friend.chans.push(username);
        await this.usersRepository.save(friend);
      }
      socket.to(socketTarget).emit('inv', { username, target });
      server.to(socket.id).emit('inv', { username, target });
    }
    if (user)
    {
      user.chans.push(username);
      await this.usersRepository.save(user);
    }
    await this.channelRepository.save({
      channel: channel,
      status: 'message',
      users: [username, target],
      owner: '',
      operator: [],
      banName: [],
      ban: [],
      mute: [],
      muteTime: [],
      password: '',
    });
    if (socketTarget)
      socket.to(socketTarget).emit('inv', { username, target });
    server.to(socket.id).emit('inv', { username, target });
  }

  async sendNotificationEvent(targetID: number) {
    const dest = await this.getSocketById(targetID);
    if (!dest) {
      return;
    }
    this.server.to(dest).emit('notification');
  }

  channelPosition(channel: string): number {
    for (let index = 0; index < this.channelStruct.length; index++) {
      if (channel === this.channelStruct[index].name) return index;
    }
    return 0;
  }

  async deleteChannel(channelToUpdate: Channel) {
    if (channelToUpdate.users.length === 0) {
      await this.chatRepository.delete({ channel: channelToUpdate.channel });
      await this.channelRepository.delete({ channel: channelToUpdate.channel });
    }
  }

  async blockedUser(server: Server, socket: Socket, username: string, target: string, cmd: string) {
    if (!this.limiteInput(target, 2)) return;
    const user = await this.usersRepository.findOne({where: {nickname: target}});
    if (!user)
      return ;
    const targetUser = await this.getSocketById(user.id);
    if (targetUser)
    {
      if (cmd === "+blocked")
      {
        server.to(socket.id).emit('blocked', target);
        const reason = username + ' just blocked you.';
        const err = { reason };
        server.to(targetUser).emit('err', err);
        server.to(targetUser).emit("quit", username);
        server.to(targetUser).emit("change-username", username);
      }
      else if (cmd === "-blocked")
      {
        const reason = username + ' just unblocked you.';
        const err = { reason };
        server.to(targetUser).emit('err', err);
      }
    }
  }

  async sendMessage(
    server: Server,
    socket: Socket,
    channel: string,
    msg: string,
    sender: string,
    blockedChat: string[],
  ) {
    if (!this.limiteInput(msg, 0)) return ;
    if (!this.limiteInput(sender, 2)) return ;
    const chan = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (chan && this.checkUserIsHere(chan.mute, sender)) {
      for (let index = 0; index < chan.mute.length; index++){
        if (chan.mute[index] === sender){
          const date : Date = new Date();
          const comp : Date = new Date(chan.muteTime[index]);
          if (date.getTime() - comp.getTime() > 0){
            if (chan.mute.length === 1){
              chan.mute = [];
              chan.muteTime = [];
            }else {
              chan.mute = chan.mute.splice(index - 1, 1);
              chan.muteTime = chan.muteTime.splice(index - 1, 1);
            }
            await this.channelRepository.save(chan);
            break;
          }
          else {
            const time = new Date(comp.getTime() - date.getTime());
            if (time.getMinutes() < 60)
            {
              const reason = time.getMinutes() < 1 ? 'You are mute for '+ time.getSeconds() + ' s.' : 'You are mute for '+ time.getMinutes() + ' min.';
              const err = { channel, reason };
              server.to(socket.id).emit('err', err);
              return false;
            }
            else
            {
              const reason = 'You are muted.';
              const err = { channel, reason };
              server.to(socket.id).emit('err', err);
              return false;
            }
          }
        }
      }
    }
    if (chan && chan.mute.includes(sender)) return;
    const send = { sender, msg, channel, blockedChat };
    const emiter = await this.userService.findByLogin(sender);
    if (emiter.isErr())
      throw new NotFoundException();

    if (channel[0] === '#') {
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: sender,
        emitterId: emiter.value.id,
      });
      socket.broadcast.emit('rcv', send);
      server.to(socket.id).emit('rcv', send);
    } else {
      const user = await this.usersRepository.findOne({where: {nickname: channel}});
      if (!user)
        return ;

      const target = await this.getSocketById(user.id);
      const prv = { sender, msg, channel };
      const find: Channel[] = await this.channelRepository.find({
        where: { status: 'message' },
      });
      for (let index = 0; find[index]; index++) {
        if (
          (find[index].users[0] == sender && find[index].users[1] == channel) ||
          (find[index].users[1] == sender && find[index].users[0] == channel)
          ) {
            await this.chatRepository.save({
              channel: find[index].channel,
              content: msg,
              emitter: sender,
              emitterId: emiter.value.id,
            });
          if (target) {
            server.to(target).emit('rcv', prv);
            server.to(socket.id).emit('rcv', prv);
          }
          return;
        }
      }
    }
  }

  async findChannel(channel: string, pwd: string)
  : Promise<Result<true, typeof APIError.InvalidPassword | typeof APIError.ChannelNotFound>>
  {
    if (!pwd) pwd = '';
    if (channel.indexOf('#') === -1) channel = '#' + channel;
    for (let i = 0; this.channelStruct[i]; i++) {
      if (
        channel === this.channelStruct[i].name &&
        pwd === this.channelStruct[i].pswd
      )
        return success(true);
      else if (
        channel === this.channelStruct[i].name &&
        pwd !== this.channelStruct[i].pswd
      )
        return failure(APIError.InvalidPassword);
    }
    return failure(APIError.ChannelNotFound);
  }

  async findChannelName(channel: string)
    : Promise<Result<true, typeof APIError.InvalidPassword | typeof APIError.ChannelNotFound>>
  {
    if (channel.indexOf('#') === -1) channel = '#' + channel;
    for (let i = 0; this.channelStruct[i]; i++) {
      if (channel === this.channelStruct[i].name && !this.channelStruct[i].pswd)
        return success(true);
      else if (
        channel === this.channelStruct[i].name &&
        this.channelStruct[i].pswd
      )
        return failure(APIError.InvalidPassword);
    }
    return failure(APIError.ChannelNotFound);
  }

  async channelAnnoucement(
    socket: Socket,
    server: Server,
    channel: string,
    msg: string,
    sender: string,
    blockedChat: string[],
    target: string,
  ) {
    if (!this.limiteInput(channel, 2)) return;
    if (!this.limiteInput(msg, 0)) return;
    if (!this.limiteInput(sender, 2)) return;
    if (!this.limiteInput(target, 2)) return;

    const emitter = 'server';
    const newMsg = target + ' has been ' + msg + ' by ' + sender + '.';
    const send = { emitter, newMsg, channel, blockedChat };
    if (channel[0] === '#') {
      await this.chatRepository.save({
        channel: channel,
        content: newMsg,
        emitter: emitter,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
      server.to(socket.id).emit('rcv', send);
    }
  }

  async channelAnnoucementOp(
    socket: Socket,
    server: Server,
    channel: string,
    action: string,
    sender: string,
    blockedChat: string[],
    target: string,
  ) {
    const emitter = 'server';
    let msg = '';
    if (action === 'op')
      msg = sender + ' made ' + target + ' an operator of this channel.';
    else if (action === 'deop')
      msg =
        sender +
        ' withdraw ' +
        target +
        ' powers, he is no longer an operator.';
    const send = { emitter, msg, channel, blockedChat };
    if (channel[0] === '#') {
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: emitter,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
      server.to(socket.id).emit('rcv', send);
    }
  }

  async announce(
    socket: Socket,
    action: string,
    username: string,
    channel: string,
    blockedChat: string[],
  ) {
    const emitter = 'announce';
    let msg = '';
    if (action === 'JOIN') {
      if (channel[0] === '#') {
        const chan = await this.channelRepository.findOne({
          where: { channel: channel },
        });
        if (chan && !this.checkUserIsHere(chan.users, username)) {
          if (channel === '#general')
            msg = username + ' just arrived on the server!';
          else
            msg =
              username + ' just joined the channel. Welcome him/her nicely.';
        }
      }
    } else if (action === 'QUIT') {
      const chan = await this.channelRepository.findOne({
        where: { channel: channel },
      });
      if (chan && channel[0] === '#')
        msg = username + ' just left the channel. Goodbye :(';
    }
    if (msg) {
      const send = { emitter, msg, channel, blockedChat };
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: emitter,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
    }
  }

  async muteUser(
    server: Server,
    socket: Socket,
    username: string,
    target: string,
    channel: string,
    time: number,
    blockedChat: string[],
  ) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(target, 2)) return;
    if (!this.limiteInput(channel, 2)) return;
    const chan = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (chan) {
      if (!chan.mute.includes(target)) {
        let actu = new Date();
        if (time === 0)
          actu = new Date(actu.getTime() + 100000000);
        else
          actu = new Date(actu.getTime() + (time * 60000));
        chan.mute.push(target);
        chan.muteTime.push(actu);
        await this.channelRepository.save(chan);
        const user = await this.userService.findByUsername(target);
        if (!user) return;
        const targetSocket = await this.getSocketById(user.id);
        const reason = "You've been muted.";
        const err = {channel , reason};
        if (targetSocket)
          server.to(targetSocket).emit('err', err);
      }
    }
  }

  async unmuteUser(
    server: Server,
    socket: Socket,
    username: string,
    target: string,
    channel: string,
    blockedChat: string[],
  ) {
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(target, 2)) return;
    if (!this.limiteInput(channel, 2)) return;

    const chan = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (chan) {
      if (chan.mute.includes(target)) {
        for (let i = 0; chan.mute[i]; i++) {
          if (chan.mute[i] === target) {
            const newMute: string[] = chan.mute.splice(i, 1);
            const dateMute: Date[] = chan.muteTime.splice(i,1);
            await this.channelRepository.update(chan.id, {
              mute: newMute,
              muteTime: dateMute,
            });
            await this.channelRepository.save(chan);
            const user = await this.userService.findByUsername(target);
            if (!user) return;
            const targetSocket = await this.getSocketById(user.id);
            const reason = "You've been unmuted.";
            const err = {channel , reason};
            if (targetSocket)
              server.to(targetSocket).emit('err', err);
            break;
          }
        }
      }
    }
  }

  async findChannelPrivateMessage(channel: string, username: string) {
    const find: Channel[] = await this.channelRepository.find({
      where: { status: 'message' },
    });
    if (!find) return null;
    for (let index = 0; find[index]; index++) {
      if (
        (find[index].users[0] == channel && find[index].users[1] == username) ||
        (find[index].users[0] == username && find[index].users[1] == channel)
      )
        return find[index].channel;
    }
    return null;
  }

  async deletePrivateChan(userOne: string, userTwo: string) {
    const findChan = await this.findChannelPrivateMessage(userOne, userTwo);
    if (!findChan) return;
    const chan = await this.channelRepository.findOne({where: {channel: findChan}});
    if (!chan) return;
    await this.chatRepository.delete({ channel: chan.channel });
    await this.channelRepository.delete({ channel: chan.channel });
  }

  async changeParam(
    server: Server,
    socket: Socket,
    channel: string,
    type: string,
    pwd: string,
    username: string,
  ) {
    if (!this.limiteInput(channel, 2)) return;
    if (!this.limiteInput(username, 2)) return;
    if (!this.limiteInput(pwd, 1)) return;
    if (!this.isValidType(type)){
      const reason = "Invalid type channel";
      const err = { channel, reason };
      server.to(socket.id).emit('err', err);
      return ;
    }
    const channelToUpdate: Channel | null =
      await this.channelRepository.findOne({ where: { channel: channel } });
    if (!channelToUpdate) return;
    if (channelToUpdate.owner !== username) return;
    if (type === 'public' || type === 'private' || type === 'protected') {
      channelToUpdate.status = type;
      if (type === 'private') {
        // verifie si c'est private changer le mdp
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(pwd, salt);
        channelToUpdate.password = hash;
      }
    }
    await this.channelRepository.save(channelToUpdate);
  }

  async JoinWithInvitation(
    server: Server,
    channel: string,
    target: string,
    id: number,
  ) {
    if (!this.limiteInput(channel, 2)) return;
    if (!this.limiteInput(target, 2)) return;

    const find = await this.usersRepository.findOneBy({ nickname: target });
    if (!find) return;
    if (find.joinChannel.includes(channel)) return;
    const channetToJoin = await this.channelRepository.findOneBy({
      channel: channel,
    });
    if (!channetToJoin) return; // Channel inexistant
    if (this.checkUserIsBanHere(channetToJoin.ban, channetToJoin.banName, target)) return; // Target is Ban
    if (channetToJoin.users.includes(target)) return; // Is already present
    find.joinChannel.push(channel);
    find.invitesId.push(id);
    await this.usersRepository.save(find);
    await this.sendNotificationEvent(find.id);
  }

  async AcceptInvitationChannel(
    socket: Socket,
    server: Server,
    channel: string,
    targetID: number,
  ) {
    if (!this.limiteInput(channel, 2)) return;
    const find = await this.usersRepository.findOne({
      where: { id: targetID },
    });
      if (!find) return; // User n'existe plus
      if (find.joinChannel.includes(channel)) {
      const channelToUpdate = await this.channelRepository.findOneBy({
          channel: channel,
      });
      if (!channelToUpdate) return; // Channel n'existe pas
      if (channelToUpdate.users.includes(find.nickname)) return; // Deja present
      if (this.checkUserIsBanHere(channelToUpdate.ban, channelToUpdate.banName, find.nickname)) return; // Il est banni
      channelToUpdate.users.push(find.nickname);
      const pos: number = find.joinChannel.indexOf(channel);
      if (pos < 0)
        return ;
      find.joinChannel.splice(pos, 1);
      find.invitesId.splice(pos, 1);
      await this.channelRepository.update(
          channelToUpdate.id,
          channelToUpdate,
      );
      await this.usersRepository.save(find);
      await this.channelRepository.save(channelToUpdate);
      const socketTarget = await this.getSocketById(find.id);
      if (socketTarget)
        server.to(socketTarget).emit('join', channel);
      if (find) {
          find.chans.push(channel);
          await this.usersRepository.save(find);
      }
      const sender = 'announce';
      const msg = find.nickname + ' just joined the channel. Welcome him/her nicely.';
      const send = { sender, msg, channel };
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: sender,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
    }
  }

  addUserSocketToList(socket: Socket) {
    const auth = socket.handshake?.auth?.token;
    const authHeaders = socket.handshake?.headers?.authorization;
    const token = auth ? auth : authHeaders;
    if (!token) return;

    const data = this.jwtService.decode(token) as TokenData;
    for (let index = 0; index < this.usersSocketList.length; index++) {
      if (data.nickname === this.usersSocketList[index].username) {
        return;
      }
    }
    this.usersSocketList.push(
      new UsersSocketStructure(data.nickname, socket.id, data.id),
    );
  }

  removeUserSocketFromList(socket: Socket) {
    const token: string | null = socket.handshake.auth.token;
    if (!token) return;

    const data = this.jwtService.decode(token) as TokenData;
    for (let index = 0; index < this.usersSocketList.length; index++) {
      if (data.nickname === this.usersSocketList[index].username) {
        this.usersSocketList.splice(index, 1);
        return;
      }
    }
  }

  async declineChannelRequest(channel: string, id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (user) {
      if (user.joinChannel.includes(channel)) {
        const channelToUpdate = await this.channelRepository.findOneBy({
          channel: channel,
        });
        if (channelToUpdate) {
          const pos: number = user.joinChannel.indexOf(channel);
          if (pos < 0)
            return ;
          user.joinChannel.splice(pos, 1);
          user.invitesId.splice(pos, 1);
          await this.usersRepository.save(user);
        }
      }
    }
  }

  async updateChat(past : string, actual: string){
    const chats = await this.chatRepository.find();
    for (const chat of chats) {
      if (chat.emitter === past) {
        chat.emitter = actual;
      }
    }
    await this.chatRepository.save(chats);
  }

  async updateChannel(past : string, actual: string){
    const channels = await this.channelRepository.find();
    for (const channel of channels){
      if (channel.owner === past)
        channel.owner === actual;
      channel.users = channel.users.map((user: string) => (user === past ? actual : user));
      channel.operator = channel.operator.map((user: string) => (user === past ? actual : user));
      channel.mute = channel.mute.map((user: string) => (user === past ? actual : user));
      channel.banName = channel.banName.map((user: string) => (user === past ? actual : user));
    }
    await this.channelRepository.save(channels);
  }

  async updatePrvChannel(past : string, actual: string) {
    const channelsPrv = await this.channelRepository.find({
      where: { status: 'message' },
    });
    for (const channel of channelsPrv){
      if (channel.users.includes(past)){
        const title = channel.channel.replace(past, actual);
        channel.channel = title;
        channel.users = channel.users.map((user: string) => (user === past ? actual : user));

        const other = channel.users[1] == actual ? channel.users[0] : channel.users[1];
        let user1 = await this.usersRepository.findOne({where : {nickname: other}});
        if (!user1) return ;
        for (let i = 0; user1.chans[i]; i ++){
          if (user1.chans[i] === past){
            user1.chans.splice(i, 1, actual);
            break;
          }
        }
        await this.usersRepository.save(user1);
      }
    }
    await this.channelRepository.save(channelsPrv);
  }

  async updateNickname(body: UserSettings, token: string){
    if (body.nickname.length == 0 || body.nickname.length > limInput)
      throw new BadRequestException('nickname must be between 1 and 15 chars');

    const result = await this.userService.getUserFromToken(token);
    if (result.isErr())
      return failure(result.error);

    await this.updateChat(result.value.nickname, body.nickname);
    await this.updateChannel(result.value.nickname, body.nickname);
    await this.updatePrvChannel(result.value.nickname, body.nickname);
  }

  async sendErr(server : Server, channel: string, target: string, reason: string){
    const user = await this.userService.findByUsername(target);
    if (!user) return;
    const targetSocket = await this.getSocketById(user.id);
    const err = {channel , reason};
    if (targetSocket)
      server.to(targetSocket).emit('err', err);
}
}
