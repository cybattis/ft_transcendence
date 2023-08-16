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
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { UseGuards } from "@nestjs/common";
import { AuthedSocket } from "../auth/types/auth.types";
import { Public } from "../auth/guards/PublicDecorator";
import { AuthService } from "../auth/auth.service";
import { APIError } from "../utils/errors";

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

  @SubscribeMessage('invite-user-to-casual-game')
  async handleInviteUserToCasualGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    const result = await this.matchmakingService.inviteUserToCasualGame(client, client.userId, data.userId);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          return "Couldn't authenticate your account. Please log out and log back in.";
        case APIError.OtherUserNotFound:
          return "Couldn't find the user you're trying to invite.";
        case APIError.UserAlreadyInGame:
          return "You can't invite someone while you are in a game.";
        case APIError.UserInMatchmaking:
          return "You can't invite someone while you are in matchmaking.";
      }
    } else {
      return "OK";
    }
  }

  @SubscribeMessage('accept-invite-to-casual-game')
  async handleAcceptInviteToCasualGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    const result = await this.matchmakingService.acceptCasualGameInvite(client, client.userId, data.userId);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          return "Couldn't authenticate your account. Please log out and log back in.";
        case APIError.OtherUserNotFound:
          return "Couldn't find the user that invited you.";
        case APIError.UserAlreadyInGame:
          return "You can't accept a game invite while you are in a game.";
        case APIError.OtherUserAlreadyInGame:
          return "The other user is currently in a game.";
        case APIError.UserInMatchmaking:
          return "You can't accept a game invite while you are in matchmaking.";
        case APIError.OtherUserInMatchmaking:
          return "The other user is currently in matchmaking.";
        case APIError.GameInviteNotFound:
          return "Couldn't find the game invite you're trying to accept.";
      }
    } else {
      return "OK";
    }
  }

  @SubscribeMessage('decline-invite-to-casual-game')
  async handleDeclineInviteToCasualGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    this.matchmakingService.declineCasualGameInvite(client.userId, data.userId);
    return "OK";
  }

  @SubscribeMessage('invite-user-to-ranked-game')
  async handleInviteUserToRankedGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    const result = await this.matchmakingService.inviteUserToRankedGame(client, client.userId, data.userId);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          return "Couldn't authenticate your account. Please log out and log back in.";
        case APIError.OtherUserNotFound:
          return "Couldn't find the user you're trying to invite.";
        case APIError.UserAlreadyInGame:
          return "You can't invite someone while you are in a game.";
        case APIError.UserInMatchmaking:
          return "You can't invite someone while you are in matchmaking.";
      }
    } else {
      return "OK";
    }
  }

  @SubscribeMessage('accept-invite-to-ranked-game')
  async handleAcceptInviteToRankedGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    const result = await this.matchmakingService.acceptRankedGameInvite(client, client.userId, data.userId);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          return "Couldn't authenticate your account. Please log out and log back in.";
        case APIError.OtherUserNotFound:
          return "Couldn't find the user that invited you.";
        case APIError.UserAlreadyInGame:
          return "You can't accept a game invite while you are in a game.";
        case APIError.OtherUserAlreadyInGame:
          return "The other user is currently in a game.";
        case APIError.UserInMatchmaking:
          return "You can't accept a game invite while you are in matchmaking.";
        case APIError.OtherUserInMatchmaking:
          return "The other user is currently in matchmaking.";
        case APIError.GameInviteNotFound:
          return "Couldn't find the game invite you're trying to accept.";
      }
    } else {
      return "OK";
    }
  }

  @SubscribeMessage('decline-invite-to-ranked-game')
  async handleDeclineInviteToRankedGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    this.matchmakingService.declineRankedGameInvite(client.userId, data.userId);
    return "OK";
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
    this.matchmakingService.leaveMatchmakingRanked(client.userId);
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
