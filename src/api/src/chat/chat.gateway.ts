import { Injectable } from '@nestjs/common'
import { ConnectedSocket, MessageBody, WsResponse ,WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {ChannelService} from "../channel/channel.service";
import { UserService } from '../user/user.service';

const gChannel = 'general'
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;


  constructor(
    private readonly channelService : ChannelService,
    private readonly userService: UserService) {}
  handleConnection(socket: Socket) {
    //console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    //console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('send :')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const blockedUsers: any = await this.userService.findByLogin(data.username);
    await this.channelService.sendMessage(socket, data.channel, data.msg, data.username, blockedUsers.blockedChat);
  }

  @SubscribeMessage('join')
  async handlePass(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    console.log(`Join data : ${data.pass} ${data.channel}`);
    const channel = data.channel;
    const username = data.username;
    this.userService.addWebSocket(username, socket.id);
    if (this.channelService.verifyUserSocket(socket.id, username))
      this.channelService.joinOldChannel(socket, username);
    this.channelService.joinChannel(socket, username, channel, data.password);
  }

  @SubscribeMessage('prv')
  handlePrv(@ConnectedSocket() socket: Socket, @MessageBody() data: {username: string, target: string}) {
    console.log(` d ${data}`);
    this.channelService.sendPrvMess(this.server ,socket, data.username, data.target);
  }

  @SubscribeMessage('blocked')
  handleBlocked(@ConnectedSocket() socket: Socket, @MessageBody() data: {target: string}) {
    this.channelService.blockedUser(this.server ,socket, data.target);
  }

  @SubscribeMessage('op')
  handleOpe(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    this.channelService.opChannel(data.channel, data.cmd, data.author, data.target);
  }

  @SubscribeMessage('quit')
  async handleQuit(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    await this.channelService.quitChannel(this.server, socket, data.cmd, data.username, data.channel);
  }

  @SubscribeMessage('ban')
  async handleBan(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    this.channelService.banChannel(data.cmd, data.username, data.target, data.channel, data.time);
    const targetSocket = await this.channelService.takeSocketByUsername(data.target);
    const channel = data.channel;
    if (targetSocket)
    {
      console.log(`inside`) ;
      this.server.to(targetSocket).emit("quit", channel);

    }
  }

  @SubscribeMessage('info')
  handleInfo(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log("fonction info");
    const channel = data.channel;
    const msg = this.channelService.infoChannel(channel);
    console.log(msg);
    this.server.emit('rcv', {msg, channel});
  }

  @SubscribeMessage('kick')
  async handleBKick(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    this.channelService.kickChannel(data.cmd, data.username, data.target, data.channel);
    const targetSocket = await this.channelService.takeSocketByUsername(data.target);
    const channel = data.channel;
    if (targetSocket)
    {
      console.log(`inside`) ;
      this.server.to(targetSocket).emit("quit", channel);
    }
  }

  @SubscribeMessage('cmd')
  handleCmd(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    const channel = data.channel;
    const msg = this.channelService.allCmd();
    this.server.emit('rcv', {msg, channel});
  }

  @SubscribeMessage('ping')
  handlePing(socket: Socket) {
    console.log(`Received ping`);
    this.server.emit('pong');
  }

  @SubscribeMessage('friendRequest')
  notifyFriendRequest(@ConnectedSocket() socket: Socket, @MessageBody() mess: {friend: any, from: string}) {
    const target = mess.friend.data;
    console.log(`Friend request Send`);
    this.channelService.sendFriendRequest(this.server, target, mess.from);
    this.server.to(target.websocket).emit('friendRequest');
  }
}
