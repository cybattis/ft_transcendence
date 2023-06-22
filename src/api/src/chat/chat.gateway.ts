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
  handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    let channel = data.channel;
    const msg = data.msg;
    const sender = data.username;
    const send = {sender, msg, channel};
    console.log(`send : s ${send.sender} m${send.msg} ${send.channel}`);
    if (data.channel[0] === "#")
      socket.broadcast.emit('rcv', send);
    else
    {
      const target = this.channelService.takeSocketByUsername(channel);
      channel = sender;
      const prv = {sender, msg, channel};
      if (target)
        socket.to(target).emit('rcv', prv);
    }
  }

  @SubscribeMessage('join')
  handlePass(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const channel = data.channel;
    const username = data.username;
    this.userService.addWebSocket(username, socket.id);
    let pass: string = '';
    if (data.password !== '')
      pass = data.password;
    if (this.channelService.verifyUserSocket(socket.id, username))
      this.channelService.joinOldChannel(socket, username);
    //console.log(data);
    this.channelService.joinChannel(socket, username, channel, pass);
  }

  @SubscribeMessage('prv')
  handlePrv(@ConnectedSocket() socket: Socket, @MessageBody() data: {username: string, target: string}) {
    console.log(` d ${data}`);
    this.channelService.sendPrvMess(this.server ,socket, data.username, data.target);
  }

  @SubscribeMessage('op')
  handleOpe(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    this.channelService.opChannel(data.channel, data.cmd, data.author, data.target);
  }

  @SubscribeMessage('quit')
  handleQuit(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(`Quit : ${data.channel}`);
    this.channelService.quitChannel(data.cmd, data.username, data.channel);
    const channel = data.channel;
    this.server.to(socket.id).emit("quit", channel);
  }
  @SubscribeMessage('ban')
  handleBan(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    this.channelService.banChannel(data.cmd, data.username, data.target, data.channel, data.time);
    const targetSocket = this.channelService.takeSocketByUsername(data.target);
    const channel = data.channel;
    if (targetSocket)
    {
      console.log(`inside`) ;
      this.server.to(targetSocket).emit("quit", channel);

    }
  }
  @SubscribeMessage('info')
  handleInfo(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    const channel = data.channel;
    const msg = this.channelService.infoChannel(channel);
    if (msg != null) {
      console.log(msg);
      this.server.emit('rcv', {msg, channel});
    }
  }

  @SubscribeMessage('kick')
  handleBKick(@ConnectedSocket() socket: Socket, @MessageBody() data: any){
    console.log(socket.id, data);
    this.channelService.kickChannel(data.cmd, data.username, data.target, data.channel);
    const targetSocket = this.channelService.takeSocketByUsername(data.target);
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
    this.server.to(target.websocket).emit('friendRequest', {target});
  }
}
