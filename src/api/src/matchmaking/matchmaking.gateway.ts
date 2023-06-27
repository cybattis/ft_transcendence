import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MatchmakingService } from "./matchmaking.service";
import { UserService } from "../user/user.service";
import { CasualMatchmakingPlayer, RankedMatchmakingPlayer } from "./types/matchmaking.type";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthedSocket } from "../auth/types/auth.types";

@UseGuards(WsAuthGuard)
@WebSocketGateway({cors: {origin: '*', methods: ["GET", "POST"]}, path: '/matchmaking'})
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private matchmakingService: MatchmakingService,
              private userService: UserService,
              private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.server = server;

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.jwtService)) {
        console.log("An authorized user connected to the matchmaking server");
        next();
      } else {
        console.log("Am unauthorized user tried to connect to the matchmaking server");
        next(new WsException("Unauthorized"));
      }
    });
  }

  handleConnection(socket: AuthedSocket) {
    console.log("A user connected to the matchmaking server");
  }

  handleDisconnect(client: AuthedSocket) {
    console.log("A user disconnected from the matchmaking server");
    this.matchmakingService.leaveMatchmaking(client.userId);
  }

  @SubscribeMessage('join-matchmaking-casual')
  async handleJoinMatchmakingCasual(@ConnectedSocket() client: AuthedSocket): Promise<void> {

    if (!await this.matchmakingService.joinMatchmakingCasual(client, client.userId)) {
      // If an error occurred, send an error message
      throw new WsException("Couldn't join the casual matchmaking");
    }
  }

  @SubscribeMessage('leave-matchmaking-casual')
  async handleLeaveMatchmakingCasual(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    this.matchmakingService.leaveMatchmakingCasual(client.userId);
  }

  @SubscribeMessage('join-matchmaking-ranked')
  async handleJoinMatchmakingRanked(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    if (!await this.matchmakingService.joinMatchmakingRanked(client, client.userId)) {
      // If an error occurred, send an error message
      throw new WsException("Couldn't join the ranked matchmaking");
    }
  }

  @SubscribeMessage('leave-matchmaking-ranked')
  async handleLeaveMatchmakingRanked(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    await this.matchmakingService.leaveMatchmakingRanked(client.userId);
  }

  @SubscribeMessage('accept-found-game')
  async handleAcceptFoundGame(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    await this.matchmakingService.acceptFoundGame(client.userId);
  }
}
