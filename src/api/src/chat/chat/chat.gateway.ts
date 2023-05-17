import { WsResponse ,WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
const gChannel = 'general'
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor() {}
  handleConnection(socket: Socket) {
     //console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    //console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('send :')
  handleMessage(socket: Socket, message: string) {
    console.log(`send ${message}`);
    const channel = this.takeChannel(message);
    const msg: string = this.takeMess(message);
    console.log(`scd ${channel}`);
    socket.broadcast.emit('rcv', { msg, channel });
  }

  @SubscribeMessage('join')
  handleJoin(socket: Socket, roomChan: string){
    console.log(`Channel join: ${roomChan}`);
    socket.join(roomChan);
    socket.emit('join', roomChan);
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
