import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer, WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthedSocket } from "../auth/types/auth.types";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { JwtService } from "@nestjs/jwt";

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

}