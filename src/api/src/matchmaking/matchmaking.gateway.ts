import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { MatchmakingService } from "./matchmaking.service";
import { UserService } from "../user/user.service";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { UseGuards } from "@nestjs/common";
import { AuthedSocket } from "../auth/types/auth.types";
import { Public } from "../auth/guards/PublicDecorator";
import { AuthService } from "../auth/auth.service";
import { JwtService } from '@nestjs/jwt';

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/matchmaking',
})
export class MatchmakingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private matchmakingService: MatchmakingService,
    private authService: AuthService
  ) {}

  afterInit(server: Server) {
    this.server = server;

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.authService)) {
        console.log('An authorized user connected to the matchmaking server');
        next();
      } else {
        console.log(
          'An unauthorized user tried to connect to the matchmaking server',
        );
        socket.emit('unauthorized');
        next(new WsException('Unauthorized'));
      }
    });
  }

  handleConnection(socket: AuthedSocket) {
    console.log('A user connected to the matchmaking server');
  }

  handleDisconnect(client: AuthedSocket) {
    console.log('A user disconnected from the matchmaking server');
    this.matchmakingService.leaveMatchmaking(client.userId);
  }

  @SubscribeMessage('join-matchmaking-casual')
  async handleJoinMatchmakingCasual(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<void> {
    if (
      !(await this.matchmakingService.joinMatchmakingCasual(
        client,
        client.userId,
      ))
    ) {
      // If an error occurred, send an error message
      throw new WsException("Couldn't join the casual matchmaking");
    }
  }

  @SubscribeMessage('leave-matchmaking-casual')
  async handleLeaveMatchmakingCasual(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<void> {
    this.matchmakingService.leaveMatchmakingCasual(client.userId);
  }

  @SubscribeMessage('join-matchmaking-ranked')
  async handleJoinMatchmakingRanked(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<void> {
    if (
      !(await this.matchmakingService.joinMatchmakingRanked(
        client,
        client.userId,
      ))
    ) {
      // If an error occurred, send an error message
      throw new WsException("Couldn't join the ranked matchmaking");
    }
  }

  @SubscribeMessage('leave-matchmaking-ranked')
  async handleLeaveMatchmakingRanked(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<void> {
    await this.matchmakingService.leaveMatchmakingRanked(client.userId);
  }

  @SubscribeMessage('accept-found-game')
  async handleAcceptFoundGame(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<void> {
    await this.matchmakingService.acceptFoundGame(client.userId);
  }

  @Public()
  @SubscribeMessage('authorization')
  async handleAuthorization(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() token: string,
  ): Promise<void> {
    client.handshake.auth.token = token;
  }
}
