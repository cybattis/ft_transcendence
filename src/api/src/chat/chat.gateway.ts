import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from '../channel/channel.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
  ) {}
  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    this.channelService.addUserSocketToList(socket);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.channelService.removeUserSocketFromList(socket);
  }

  @SubscribeMessage('send')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const blockedUsers: any = await this.userService.findByLogin(data.username);
    await this.channelService.sendMessage(
      this.server,
      socket,
      data.channel,
      data.msg,
      data.username,
      blockedUsers.blockedChat,
    );
  }

  @SubscribeMessage('sendGame')
  async handleGameMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    let blockedUsers: any = await this.userService.findByLogin(data.username);
    if (!blockedUsers)
      blockedUsers = [];
    await this.channelService.sendGameMessage(
      this.server,
      socket,
      data.channel,
      data.msg,
      data.username,
      data.opponent,
      blockedUsers.blockedChat,
    );
  }

  @SubscribeMessage('join')
  async handlePass(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { username: string; channel: string; password: string; type: string },
  ) {
    let type, pass, username, channel: string;
    if (!data) return;
    !data.channel ? (channel = '#general') : (channel = data.channel);
    !data.username ? (username = '') : (username = data.username);
    !data.password ? (pass = '') : (pass = data.password);
    !data.type ? (type = '') : (type = data.type);
    if (username === '')
      return;
    await this.channelService.joinOldChannel(socket, username);

    const blockedUsers = await this.userService.findByLogin(data.username);
    await this.channelService.joinChannel(
      this.server,
      socket,
      type,
      username,
      channel,
      pass,
      blockedUsers,
    );
  }

  @SubscribeMessage('joinGame')
  async joinGameChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { canal: string },
  ) {
    if (!data) return;
    await this.channelService.joinGameChannel(
      socket,
      data.canal,
    );
  }

  @SubscribeMessage('change')
  async handleChange(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { channel: string; type: string; pwd: string; username: string },
  ) {
    await this.channelService.changeParam(
      data.channel,
      data.type,
      data.pwd,
      data.username,
    );
  }

  @SubscribeMessage('prv')
  async handlePrv(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { username: string; target: string },
  ) {
    await this.channelService.sendPrvMess(
      this.server,
      socket,
      data.username,
      data.target,
    );
  }

  @SubscribeMessage('blocked')
  async handleBlocked(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { target: string },
  ) {
    await this.channelService.blockedUser(this.server, socket, data.target);
  }

  @SubscribeMessage('mute')
  async handleMute(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const blockedUsers: any = await this.userService.findByLogin(data.username);
    await this.channelService.muteUser(
      socket,
      data.username,
      data.target,
      data.channel,
      blockedUsers,
    );
  }

  @SubscribeMessage('unmute')
  async handleUnMute(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const blockedUsers: any = await this.userService.findByLogin(data.username);
    await this.channelService.unmuteUser(
      socket,
      data.username,
      data.target,
      data.channel,
      blockedUsers,
    );
  }

  @SubscribeMessage('op')
  async handleOpe(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    await this.channelService.opChannel(
      socket,
      data.channel,
      data.cmd,
      data.author,
      data.target,
    );
  }

  @SubscribeMessage('quit')
  async handleQuit(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    await this.channelService.quitChannel(
      data.cmd,
      data.username,
      data.channel,
    );
    const channel = data.channel;
    this.server.to(socket.id).emit('quit', channel);
    const blockedUsers: any = await this.userService.findByLogin(data.username);
    await this.channelService.announce(
      socket,
      'QUIT',
      data.username,
      data.channel,
      blockedUsers,
    );
  }

  @SubscribeMessage('ban')
  async handleBan(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    await this.channelService.banChannel(
      data.cmd,
      data.username,
      data.target,
      data.channel,
      data.time,
    );
    const targetSocket = await this.channelService.getSocketByUsername(
      data.target,
    );
    const channel = data.channel;
    if (targetSocket) {
      this.server.to(targetSocket).emit('quit', channel);
      const blockedUsers: any = await this.userService.findByLogin(
        data.username,
      );
      await this.channelService.channelAnnoucement(
        socket,
        data.channel,
        'banned',
        data.username,
        blockedUsers.blockedChat,
        data.target,
      );
    }
  }

  @SubscribeMessage('unban')
  async handleUnBan(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    await this.channelService.unbanChannel(
      data.cmd,
      data.username,
      data.target,
      data.channel,
    );
    const targetSocket = await this.channelService.getSocketByUsername(
      data.target,
    );
    const channel = data.channel;
    if (targetSocket) {
      this.server.to(targetSocket).emit('unban', channel);
      const blockedUsers: any = await this.userService.findByLogin(
        data.username,
      );
      await this.channelService.channelAnnoucement(
        socket,
        data.channel,
        'unbanned',
        data.username,
        blockedUsers.blockedChat,
        data.target,
      );
    }
  }

  @SubscribeMessage('kick')
  async handleBKick(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    if (
      await this.channelService.kickChannel(
        this.server,
        data.cmd,
        data.username,
        data.target,
        data.channel,
      )
    ) {
      const target = this.channelService.getSocketByUsername(data.target);
      if (target) {
        this.server.to(target).emit('quit', data.channel);
        const blockedUsers: any = await this.userService.findByLogin(
          data.username,
        );
        await this.channelService.channelAnnoucement(
          socket,
          data.channel,
          'kicked',
          data.username,
          blockedUsers.blockedChat,
          data.target,
        );
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(socket: Socket) {
    console.log(`Received ping`);
    this.server.emit('pong');
  }

  @SubscribeMessage('friend-request')
  notifyFriendRequest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() targetID: number,
  ) {
    this.channelService.sendFriendRequest(this.server, targetID);
  }

  @SubscribeMessage('notif-event')
  notifyEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() target: number,
  ) {
    const targetSocket = this.channelService.getSocketById(target);
    if (!targetSocket) {
      console.log(`socket not found`);
      return;
    }
    this.server.to(targetSocket).emit('notification');
  }

  @SubscribeMessage('inv')
  async handleInvitation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string; target: string, id: number },
  ) {
    await this.channelService.JoinWithInvitation(this.server, data.channel, data.target, data.id);
  }

  @SubscribeMessage('acc')
  async AcceptInvitationChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string; target: string },
  ) {
    await this.channelService.AcceptInvitationChannel(
      this.server,
      data.channel,
      data.target,
    );
  }
}
