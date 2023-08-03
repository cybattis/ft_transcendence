import {
  UnauthorizedException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ChannelStructure } from './channel.structure';
import { banStructure } from './channel.structure';
import { Socket, Server } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TokenData } from '../type/jwt.type';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { UsersSocketStructure } from './usersSocket.structure';
import { User } from 'src/user/entity/Users.entity';

@Injectable()
export class ChannelService implements OnModuleInit {
  private jwtService: JwtService;

  private channelStruct: ChannelStructure[];
  private usersSocketList: UsersSocketStructure[];

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userService: UserService,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private moduleRef: ModuleRef,
  ) {
    this.channelStruct = [];
    this.usersSocketList = [];
  }

  async onModuleInit() {
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
    const rowCount = await this.channelRepository.count();
    if (rowCount == 0)
      await this.channelRepository.save({
        channel: '#general',
        status: 'public',
        users: [],
        owner: '',
        operator: [],
        ban: [],
        mute: [],
        password: '',
      });
  }

  listUsersChannel(channel: string) {
    for (let index = 0; index < this.channelStruct.length; index++) {
      if (channel === this.channelStruct[index].name) {
        return this.channelStruct[index].users;
      }
    }
    return null;
  }

  async quitChannel(cmd: string, username: string, channel: string) {
    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (this.checkUserIsHere(channelToUpdate.operator, username))
      await this.kickOp(channelToUpdate, username);
    if (this.checkUserIsHere(channelToUpdate.users, username))
      await this.kickUser(channelToUpdate, username);

    await this.deleteChannel(channelToUpdate);
  }

  async kickChannel(
    server: Server,
    cmd: string,
    username: string,
    target: string,
    channel: string,
  ) {
    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return false;
    if (!this.checkUserIsHere(channelToUpdate.operator, username)) {
      console.log(`Ban : ${username} isn't operator`);
      return false;
    }
    if (!this.checkUserIsHere(channelToUpdate.users, target)) {
      console.log(`Ban : ${target} isn't users`);
      return false;
    }
    if (cmd === 'kick') {
      console.log(`Kick Target ${target}`);
      await this.kickOp(channelToUpdate, target);
      await this.kickUser(channelToUpdate, target);
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
    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (!this.checkUserIsHere(channelToUpdate.operator, username))
      return `Ban : ${username} isn't operator`;
    const timeBan: number = this.valideTime(time);
    console.log(`time : ${timeBan}`);
    if (cmd === '+b') await this.actBan(channelToUpdate, target, timeBan);
    await this.deleteChannel(channelToUpdate);
  }

  async unbanChannel(
    cmd: string,
    username: string,
    target: string,
    channel: string,
  ) {
    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (!this.checkUserIsHere(channelToUpdate.ban, target))
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
      if (channelToUpdate.ban[index] === target) return;
    }
    channelToUpdate.ban.push(target);
    await this.channelRepository.save(channelToUpdate);
  }

  async actUnban(channelToUpdate: Channel, target: string) {
    for (let index = 0; channelToUpdate.ban[index]; index++) {
      if (channelToUpdate.ban[index] === target)
        channelToUpdate.ban.splice(index, 1);
    }
    await this.channelRepository.save(channelToUpdate);
  }

  async opChannel(
    socket: Socket,
    channel: string,
    cmd: string,
    author: string,
    target: string,
  ) {
    const channelToUpdate: Channel | null =
      await this.channelRepository.findOneBy({ channel: channel });
    if (!channelToUpdate) return;
    if (!this.checkUserIsHere(channelToUpdate.operator, author)) {
      //Send error message
      return;
    }
    if (cmd === '+o') {
      await this.addNewOp(channelToUpdate, target);
      const blockedUsers: any = await this.userService.findByLogin(author);
      await this.channelAnnoucementOp(
        socket,
        channel,
        'op',
        author,
        blockedUsers.blockedChat,
        target,
      );
    } else if (cmd === '-o') {
      await this.kickOp(channelToUpdate, target);
      const blockedUsers: any = await this.userService.findByLogin(author);
      await this.channelAnnoucementOp(
        socket,
        channel,
        'deop',
        author,
        blockedUsers.blockedChat,
        target,
      );
    } else {
      console.log('error invalid cmd');
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

  getSocketByUsername(username: string): string | null {
    for (let index = 0; index < this.usersSocketList.length; index++) {
      if (username === this.usersSocketList[index].username)
        return this.usersSocketList[index].socket;
    }
    return null;
  }

  getSocketById(id: number): string | null {
    const user = this.userService.findByID(id);
    if (!user) return null;
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

  async tryJoin(
    server: Server,
    socket: Socket,
    type: string,
    username: string,
    channel: string,
    pass: string,
    blockedChat: any,
  ) {
    console.log('Inside');
    const channelToJoin = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (!channelToJoin) return;
    if (channelToJoin.status === 'public') {
      if (this.checkUserIsHere(channelToJoin.ban, username)) {
        const reason = 'You are banned.';
        const err = { channel, reason };
        server.to(socket.id).emit('err', err);
        return;
      }
      if (this.checkUserIsHere(channelToJoin.users, username)) {
        const reason = 'You are aleready present';
        const err = { channel, reason };
        server.to(socket.id).emit('err', err);
        return;
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
    } else if (channelToJoin.status === 'protected') {
      const reason = 'The channel is protected, you have to be invited.';
      const err = { channel, reason };
      server.to(socket.id).emit('err', err);
      return; // Only invitation
    } else if (channelToJoin.status === 'private') {
      if (this.checkUserIsHere(channelToJoin.ban, username)) {
        const reason = 'You are banned.';
        const data = { channel, reason };
        server.to(socket.id).emit('err', data);
        return; // Send message pour deja liste banni
      }
      if (this.checkUserIsHere(channelToJoin.users, username)) {
        const reason = 'You are already present.';
        const err = { channel, reason };
        server.to(socket.id).emit('err', err);
        return; // deja present
      }
      if (!(await bcrypt.compare(pass, channelToJoin.password))) {
        const reason = 'Bad password';
        const err = { channel, reason };
        server.to(socket.id).emit('err', err);
        return; // bad mpd
      }
      console.log('Await', await bcrypt.compare(pass, channelToJoin.password));
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
    } else console.log('Aucun type de channel');
  }

  async joinChannel(
    server: Server,
    socket: Socket,
    type: string,
    username: string,
    channel: string,
    pass: string,
    blockedChat: any,
  ) {
    if (channel === '#general') {
      const channelToUpdate = await this.channelRepository.findOne({
        where: { channel: channel },
      });
      if (!channelToUpdate) return;
      if (this.checkUserIsHere(channelToUpdate.users, username)) return;
      channelToUpdate.users.push(username);
      await this.channelRepository.save(channelToUpdate);
      socket.join(channel);
      socket.emit('join', channel);
      const sender = 'announce';
      const msg = username + ' just joined the Server!';
      const send = { sender, msg, channel, blockedChat };
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: sender,
        emitterId: 0,
      });
      socket.broadcast.emit('rcv', send);
    } else {
      const channelToJoin = await this.channelRepository.findOne({
        where: { channel: channel },
      });
      if (channelToJoin)
        await this.tryJoin(
          server,
          socket,
          type,
          username,
          channel,
          pass,
          blockedChat,
        );
      else {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(pass, salt);
        await this.channelRepository.save({
          channel: channel,
          status: type,
          users: [username],
          owner: username,
          operator: [username],
          ban: [],
          mute: [],
          password: hash,
        });
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

  async joinGameChannel(
    socket: Socket,
    canal: string,
  ) {
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
    const socketTarget = this.getSocketByUsername(target);
    const channel = username + target;
    const res: string | null = await this.findChannelPrivateMessage(
      username,
      target,
    );
    if (res !== null) return;
    if (socketTarget) {
      await this.channelRepository.save({
        channel: channel,
        status: 'message',
        users: [username, target],
        owner: '',
        operator: [],
        ban: [],
        mute: [],
        password: '',
      });
      socket.to(socketTarget).emit('inv', { username, target });
      server.to(socket.id).emit('inv', { username, target });
    }
  }

  sendFriendRequest(server: Server, targetID: number) {
    const dest: string | null = this.getSocketById(targetID);
    if (!dest) {
      console.log('User not connected');
      return;
    }
    server.to(dest).emit('notification');
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

  async blockedUser(server: Server, socket: Socket, target: string) {
    const targetUser = this.getSocketByUsername(target);
    if (targetUser != null) server.to(socket.id).emit('blocked', target);
  }

  async sendMessage(
    server: Server,
    socket: Socket,
    channel: string,
    msg: string,
    sender: string,
    blockedChat: any,
  ) {
    const chan = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (chan && chan.mute.includes(sender)) return;
    const send = { sender, msg, channel, blockedChat };
    const emiter: any = await this.userService.findByLogin(sender);
    if (channel[0] === '#') {
      await this.chatRepository.save({
        channel: channel,
        content: msg,
        emitter: sender,
        emitterId: emiter.id,
      });
      socket.broadcast.emit('rcv', send);
      server.to(socket.id).emit('rcv', send)
    } else {
      const target = this.getSocketByUsername(channel);
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
            emitterId: emiter.id,
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

  async sendGameMessage(
    server: Server,
    socket: Socket,
    channel: string,
    msg: string,
    sender: string,
    opponent: string,
    blockedUsers: any,
  ) {
      const prv = { sender, opponent, msg, channel, blockedUsers };
      const target = this.getSocketByUsername(opponent);
      if (target)
        server.to(target).emit('rcvgame', prv);
      server.to(socket.id).emit('rcvgame', prv);
    }

  async findChannel(channel: string, pwd: string) {
    if (!pwd) pwd = '';
    if (channel.indexOf('#') === -1) channel = '#' + channel;
    for (let i = 0; this.channelStruct[i]; i++) {
      if (
        channel === this.channelStruct[i].name &&
        pwd === this.channelStruct[i].pswd
      )
        return 1;
      else if (
        channel === this.channelStruct[i].name &&
        pwd !== this.channelStruct[i].pswd
      )
        return new UnauthorizedException('Password mismatch');
    }
    return new NotFoundException("Channel doesn't exists");
  }

  async findChannelName(channel: string) {
    if (channel.indexOf('#') === -1) channel = '#' + channel;
    for (let i = 0; this.channelStruct[i]; i++) {
      if (channel === this.channelStruct[i].name && !this.channelStruct[i].pswd)
        return 1;
      else if (
        channel === this.channelStruct[i].name &&
        this.channelStruct[i].pswd
      )
        return new UnauthorizedException('Password mismatch');
    }
    return new NotFoundException("Channel doesn't exists");
  }

  async channelAnnoucement(
    socket: Socket,
    channel: string,
    msg: string,
    sender: string,
    blockedChat: any,
    target: string,
  ) {
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
    }
  }

  async channelAnnoucementOp(
    socket: Socket,
    channel: string,
    action: string,
    sender: string,
    blockedChat: any,
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
    }
  }

  async announce(
    socket: Socket,
    action: string,
    username: string,
    channel: string,
    blockedChat: any,
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
    socket: Socket,
    username: string,
    target: string,
    channel: string,
    blockedChat: any,
  ) {
    const chan = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (chan) {
      if (!chan.mute.includes(target)) {
        chan.mute.push(target);
        await this.channelRepository.save(chan);
        const msg = target + ' has been muted by ' + username;
        const emitter = 'server';
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
  }

  async unmuteUser(
    socket: Socket,
    username: string,
    target: string,
    channel: string,
    blockedChat: any,
  ) {
    const chan = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (chan) {
      if (chan.mute.includes(target)) {
        for (let i = 0; chan.mute[i]; i++) {
          if (chan.mute[i] === target) {
            const newMute: string[] = chan.mute.splice(i, 1);
            await this.channelRepository.update(chan.id, {
              mute: newMute,
            });
            await this.channelRepository.save(chan);
            break;
          }
        }
        const msg = target + ' has been unmuted by ' + username;
        const emitter = 'server';
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

  async changeParam(
    channel: string,
    type: string,
    pwd: string,
    username: string,
  ) {
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

  async JoinWithInvitation(server: Server, channel: string, target: string, id: number) {
    const find = await this.usersRepository.findOneBy({ nickname: target });
    if (!find) return;
    if (find.joinChannel.includes(channel))
      return ;
    const channetToJoin = await this.channelRepository.findOneBy({ channel: channel});
    if (!channetToJoin)
      return; // Channel inexistant
    if (channetToJoin.ban.includes(target))
      return; // Target is Ban
    if (channetToJoin.users.includes(target))
      return; // Is already present
    find.joinChannel.push(channel);
    find.invitesId.push(id);
    await this.usersRepository.save(find);
    this.sendFriendRequest(server, find.id);
  }

  async AcceptInvitationChannel(server: Server, channel: string, target: string) {
    const find = await this.usersRepository.findOne({
      where: { nickname: target },
    });
    if (!find) return;
    for (let index = 0; find.joinChannel[index]; index++) {
      if (channel === find.joinChannel[index]) {
        find.joinChannel.splice(index, 1);
        find.invitesId.splice(index, 1);
        await this.channelRepository.save(find);
        const targetId = this.getSocketById(find.id);
        if (!targetId) return;
        server.to(targetId).emit('join', channel)
      }
    }
    // Channel n'existe plus
  }

  addUserSocketToList(socket: Socket) {
    const token: string | null = socket.handshake.auth.token;
    if (!token) return;

    const data = this.jwtService.decode(token) as TokenData;
    for (let index = 0; index < this.usersSocketList.length; index++) {
      if (data.nickname === this.usersSocketList[index].username) {
        console.log('socket already present');
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

  async acceptChannelRequest(channel: string, id: number){
    const user = await this.usersRepository.findOneBy( {id: id} )
    if (user){
      if(user.joinChannel.includes(channel)){
        const channelToUpdate =  await this.channelRepository.findOneBy({channel: channel});
        if (channelToUpdate)
        {
          channelToUpdate.users.push(user.nickname);
          const pos: number = user.joinChannel.indexOf(channel);
          user.joinChannel.splice(pos, 1);
          await this.channelRepository.update(channelToUpdate.id, channelToUpdate);
          await this.usersRepository.save(user);
        }
      }
    }
  }

  async declineChannelRequest(channel: string, id: number){
    const user = await this.usersRepository.findOneBy( {id: id} )
    if (user){
      if(user.joinChannel.includes(channel)){
        const channelToUpdate =  await this.channelRepository.findOneBy({channel: channel});
        if (channelToUpdate) {
          const pos: number = user.joinChannel.indexOf(channel);
          user.joinChannel.splice(pos, 1);
          user.invitesId.splice(pos, 1);
          await this.usersRepository.save(user);
        }
      }
    }
  }
}
