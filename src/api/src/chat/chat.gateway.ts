import {Injectable, UseGuards} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect, OnGatewayInit, WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from '../channel/channel.service';
import { UserService } from '../user/user.service';
import {WsAuthGuard} from "../auth/guards/ws.auth.guard";
import { AuthedSocket } from "../auth/types/auth.types";
import {AuthService} from "../auth/auth.service";


@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.channelService.setServer(server);

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.authService)) {
        next();
      } else {
        socket.emit('unauthorized');
        next(new WsException("Unauthorized"));
      }
    });
  }

  async handleConnection(socket: AuthedSocket) {
    this.channelService.addUserSocketToList(socket);
    await this.userService.changeOnlineStatus(socket.userId, true);
  }

  async handleDisconnect(socket: AuthedSocket) {
    const auth = socket.handshake?.auth?.token;
    const authHeaders = socket.handshake?.headers?.authorization;
    const token = auth ? auth : authHeaders;
    await this.userService.changeOnlineStatus(socket.userId, false);
    this.channelService.removeUserSocketFromList(socket);
  }

  @SubscribeMessage('send')
  async handleMessage(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: any,
  ) {
    const blockedUsers = await this.userService.findByLogin(data.username);
    if (blockedUsers.isErr())
      return;
    await this.channelService.sendMessage(
      this.server,
      socket,
      data.channel,
      data.msg,
      data.username,
      blockedUsers.value.blockedChat,
    );
  }

  @SubscribeMessage('sendGame')
  async handleGameMessage(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: any,
  ) {
    let blockedUsers = await this.userService.findByLogin(data.username);
    if (blockedUsers.isErr())
      return;

    await this.channelService.sendGameMessage(
      this.server,
      socket,
      data.channel,
      data.msg,
      data.username,
      data.opponent,
      blockedUsers.value.blockedChat,
    );
  }

  @SubscribeMessage('join')
  async handlePass(
    @ConnectedSocket() socket: AuthedSocket,
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
    //await this.channelService.joinOldChannel(socket, username);

    const blockedUsers = await this.userService.findByLogin(data.username);
    if (blockedUsers.isErr())
      return;

    await this.channelService.joinChannel(
      this.server,
      socket,
      type,
      username,
      channel,
      pass,
      blockedUsers.value.blockedChat,
    );
  }

  @SubscribeMessage('joinGame')
  async joinGameChat(
    @ConnectedSocket() socket: AuthedSocket,
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
    @ConnectedSocket() socket: AuthedSocket,
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
    @ConnectedSocket() socket: AuthedSocket,
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
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: { target: string },
  ) {
    await this.channelService.blockedUser(this.server, socket, data.target);
  }

  @SubscribeMessage('mute')
  async handleMute(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: any,
  ) {
    const blockedUsers = await this.userService.findByLogin(data.username);
    if (blockedUsers.isErr())
      return;

    await this.channelService.muteUser(
      socket,
      data.username,
      data.target,
      data.channel,
      blockedUsers.value.blockedChat,
    );
  }

  @SubscribeMessage('unmute')
  async handleUnMute(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: any,
  ) {
    const blockedUsers = await this.userService.findByLogin(data.username);
    if (blockedUsers.isErr())
      return;

    await this.channelService.unmuteUser(
      socket,
      data.username,
      data.target,
      data.channel,
      blockedUsers.value.blockedChat,
    );
  }

  @SubscribeMessage('op')
  async handleOpe(@ConnectedSocket() socket: AuthedSocket, @MessageBody() data: any) {
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
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: any,
  ) {
    await this.channelService.quitChannel(
      data.cmd,
      data.username,
      data.channel,
    );
    const channel = data.channel;
    this.server.to(socket.id).emit('quit', channel);
    const blockedUsers = await this.userService.findByLogin(data.username);
    if (blockedUsers.isErr())
      return;

    await this.channelService.announce(
      socket,
      'QUIT',
      data.username,
      data.channel,
      blockedUsers.value.blockedChat,
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
      const blockedUsers = await this.userService.findByLogin(
        data.username,
      );
      if (blockedUsers.isErr())
        return;

      await this.channelService.channelAnnoucement(
        socket,
        data.channel,
        'banned',
        data.username,
        blockedUsers.value.blockedChat,
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
    @ConnectedSocket() socket: AuthedSocket,
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
        const blockedUsers = await this.userService.findByLogin(
          data.username,
        );
        if (blockedUsers.isErr())
          return;

        await this.channelService.channelAnnoucement(
          socket,
          data.channel,
          'kicked',
          data.username,
          blockedUsers.value.blockedChat,
          data.target,
        );
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing() {
    this.server.emit('pong');
  }

  @SubscribeMessage('notif-event')
  async notifyEvent(@MessageBody() target: number) {
    const targetSocket = await this.channelService.getSocketById(target);
    if (!targetSocket) {
      return;
    }
    this.server.to(targetSocket).emit('notification');
  }

  @SubscribeMessage('change-username')
  async changeUsernameUpdate(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() newName: string,
  ) {
    socket.broadcast.emit('change-username', newName);
  }

  @SubscribeMessage('inv')
  async handleInvitation(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: { channel: string; target: string, id: number },
  ) {
    await this.channelService.JoinWithInvitation(this.server, data.channel, data.target, data.id);
  }

  @SubscribeMessage('acc')
  async AcceptInvitationChannel(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() data: { channel: string; targetID: number },
  ) {
    await this.channelService.AcceptInvitationChannel(
      socket,
      this.server,
      data.channel,
      data.targetID,
    );
  }
}
