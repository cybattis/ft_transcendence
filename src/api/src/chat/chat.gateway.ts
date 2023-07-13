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
    await this.channelService.sendMessage(socket, data.channel, data.msg, data.username);
  }

  @SubscribeMessage('join')
  async handlePass(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const channel = data.channel;
    const username = data.username;
    console.log(`${socket.id} : ${username}`)
    this.userService.addWebSocket(username, socket.id);
    if (this.channelService.verifyUserSocket(socket.id, username))
      await this.channelService.joinOldChannel(socket, username);
    this.channelService.joinChannel(socket, data.type, username, channel, data.password);
  }

  @SubscribeMessage('prv')
  handlePrv(@ConnectedSocket() socket: Socket, @MessageBody() data: {username: string, target: string}) {
    console.log(` d ${data}`);
    this.channelService.sendPrvMess(this.server ,socket, data.username, data.target);
  }

  @SubscribeMessage('blocked')
  async handleBlocked(@ConnectedSocket() socket: Socket, @MessageBody() data: {target: string}) {
    await this.channelService.blockedUser(this.server ,socket, data.target);
  }

  @SubscribeMessage('op')
  async handleOpe(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    await this.channelService.opChannel(data.channel, data.cmd, data.author, data.target);
  }

  @SubscribeMessage('quit')
  async handleQuit(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(`Quit : ${data.channel}`);
    await this.channelService.quitChannel(data.cmd, data.username, data.channel);
    const channel = data.channel;
    this.server.to(socket.id).emit("quit", channel);
  }

  @SubscribeMessage('ban')
  async handleBan(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    await this.channelService.banChannel(data.cmd, data.username, data.target, data.channel, data.time);
    const targetSocket = this.channelService.takeSocketByUsername(data.target);
    const channel = data.channel;
    if (targetSocket)
    {
      console.log(`inside`) ;
      this.server.to(targetSocket).emit("quit", channel);
    }
  }

  @SubscribeMessage('info')
  async handleInfo(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log("fonction info");
    const channel = data.channel;
    const msg = await this.channelService.infoChannel(channel);
    console.log(msg);
    this.server.emit('rcv', {msg, channel});
  }

  @SubscribeMessage('kick')
  async handleBKick(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    if (await this.channelService.kickChannel(this.server ,data.cmd, data.username, data.target, data.channel)){
      console.log(`Bien le sur ${data.target}`);
      const target = this.channelService.takeSocketByUsername(data.target);
      if (target)
        this.server.to(target).emit("quit", data.channel);
    }

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
    this.server.to(target.websocket).emit('friendRequest', {target});
  }
}
