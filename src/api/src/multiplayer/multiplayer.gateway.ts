import {
  ConnectedSocket, MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthedSocket } from "../auth/types/auth.types";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { JwtService } from "@nestjs/jwt";
import { Public } from "../auth/guards/PublicDecorator";

@WebSocketGateway({cors: {origin: '*', methods: ["GET", "POST"]}, path: "/multiplayer"})
export class MultiplayerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.server = server;

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.jwtService)) {
        console.log("An authorized user connected to the multiplayer server");
        next();
      } else {
        console.log("An unauthorized user tried to connect to the multiplayer server");
        socket.emit('unauthorized');
        next(new WsException("Unauthorized"));
      }
    });
  }

  handleConnection(socket: Socket) {
    console.log("A user connected to the multiplayer server");
  }

  handleDisconnect(socket: Socket) {
    console.log("A user disconnected from the multiplayer server");
  }

  @Public()
  @SubscribeMessage('authorization')
  async handleAuthorization(@ConnectedSocket() client: AuthedSocket, @MessageBody() token: string): Promise<void> {
    client.handshake.auth.token = token;
  }

}