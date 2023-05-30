import { Injectable } from '@nestjs/common'
import { WsResponse ,WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {ChannelService} from "../channel/channel.service";

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

  constructor(private readonly channelService : ChannelService) {}
  handleConnection(socket: Socket) {
     //console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    //console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('send :')
  handleMessage(socket: Socket, message: string) {
    const channel = this.takeChannel(message);
    const msg: string = this.takeMess(message);
    socket.broadcast.emit('rcv', { msg, channel });
  }

  @SubscribeMessage('join')
  handleJoin(socket: Socket, roomChan: string){
    socket.join(roomChan);
    socket.emit('join', roomChan);
    this.channelService.addChannel(roomChan, socket.id);
  }
  
  @SubscribeMessage('ping')
  handlePing(socket: Socket) {
    console.log(`Received ping`);
    this.server.emit('pong');
  }

  takeChannel(message: string){
    if(message.indexOf("#") == -1)
      return (gChannel);
    const channel = message.substring(message.indexOf("#"));
    if (channel.indexOf(" ") != -1)
      return (channel.substring(0, channel.indexOf(" ")));
    return channel;
  }

  takeMess(mess: string):string{
    return (mess.substring(mess.indexOf('%') + 1));
  }
}
