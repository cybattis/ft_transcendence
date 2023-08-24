import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { MatchmakingService } from "./matchmaking.service";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { UseGuards } from "@nestjs/common";
import { AuthedSocket } from "../auth/types/auth.types";
import { Public } from "../auth/guards/PublicDecorator";
import { AuthService } from "../auth/auth.service";
import { APIError } from "../utils/errors";
import { MatchmakingPlayerStatusDTO } from "./types/matchmaking.type";

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

  private static connections: Map<number, number> = new Map<number, number>();

  constructor(
    private matchmakingService: MatchmakingService,
    private authService: AuthService
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.matchmakingService.setServer(server);

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.authService)) {
        //console.log('An authorized user connected to the matchmaking server');
        next();
      } else {
        //console.log(
        //  'An unauthorized user tried to connect to the matchmaking server',
        //);
        socket.emit('unauthorized');
        next(new WsException('Unauthorized'));
      }
    });
  }

  handleConnection(socket: AuthedSocket) {
    console.log('A user connected to the matchmaking server');
    socket.join(getSyncRoom(socket));
    const connectionNumber = MatchmakingGateway.connections.get(socket.userId);
    if (connectionNumber !== undefined)
      MatchmakingGateway.connections.set(socket.userId, connectionNumber + 1);
    else
      MatchmakingGateway.connections.set(socket.userId, 1);
  }

  async handleDisconnect(client: AuthedSocket): Promise<void> {
    console.log('A user disconnected from the matchmaking server');
    const connectionNumber = MatchmakingGateway.connections.get(client.userId);
    if (connectionNumber !== undefined) {
      MatchmakingGateway.connections.set(client.userId, connectionNumber - 1);
      if (connectionNumber === 1)
        await this.matchmakingService.leaveMatchmaking(client.userId);
    } else
      MatchmakingGateway.connections.set(client.userId, 0);
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
    }
    return "OK";
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
    }
    return "OK";
  }

  @SubscribeMessage('decline-invite-to-casual-game')
  async handleDeclineInviteToCasualGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    await this.matchmakingService.declineCasualGameInvite(client.userId, data.userId);
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
    }
    return "OK";
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
    }
    return "OK";
  }

  @SubscribeMessage('decline-invite-to-ranked-game')
  async handleDeclineInviteToRankedGame(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { userId: number },
  ): Promise<string>
  {
    await this.matchmakingService.declineRankedGameInvite(client.userId, data.userId);
    return "OK";
  }

  @SubscribeMessage('join-matchmaking-casual')
  async handleJoinMatchmakingCasual(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<string> {
    const result = await this.matchmakingService.joinMatchmakingCasual(
      client, client.userId);
    if (result.isErr()) {
      switch(result.error) {
        case APIError.UserNotFound:
          return "Couldn't authenticate your account. Please log out and log back in.";
        case APIError.UserAlreadyInGame:
          return "You can't join matchmaking while you are in a game.";
        case APIError.UserInMatchmaking:
          return "You are already in matchmaking.";
      }
    }

    client
      .to(getSyncRoom(client))
      .emit("sync", this.matchmakingService.getPlayerStatus(client.userId));
    return "OK";
  }

  @SubscribeMessage('leave-matchmaking-casual')
  async handleLeaveMatchmakingCasual(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<string> {
    await this.matchmakingService.leaveMatchmakingCasual(client.userId);

    client
      .to(getSyncRoom(client))
      .emit("sync", this.matchmakingService.getPlayerStatus(client.userId));
    return "OK";
  }

  @SubscribeMessage('join-matchmaking-ranked')
  async handleJoinMatchmakingRanked(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<string> {
    const result = await this.matchmakingService.joinMatchmakingRanked(
        client, client.userId);
    if (result.isErr()) {
      switch(result.error) {
        case APIError.UserNotFound:
          return "Couldn't authenticate your account. Please log out and log back in.";
        case APIError.UserAlreadyInGame:
          return "You can't join matchmaking while you are in a game.";
        case APIError.UserInMatchmaking:
          return "You are already in matchmaking.";
      }
    }

    client
      .to(getSyncRoom(client))
      .emit("sync", this.matchmakingService.getPlayerStatus(client.userId));
    return "OK";
  }

  @SubscribeMessage('leave-matchmaking-ranked')
  async handleLeaveMatchmakingRanked(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<string> {
    await this.matchmakingService.leaveMatchmakingRanked(client.userId);

    client
      .to(getSyncRoom(client))
      .emit("sync", this.matchmakingService.getPlayerStatus(client.userId));
    return "OK";
  }

  @SubscribeMessage('accept-found-game')
  async handleAcceptFoundGame(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<string> {
    const result = await this.matchmakingService.acceptFoundGame(client.userId, client);
    if (result.isErr()) {
      switch(result.error) {
        case APIError.GameNotFound:
          return "Couldn't find the game you're trying to accept.";
      }
    }

    client
      .to(getSyncRoom(client))
      .emit("sync", this.matchmakingService.getPlayerStatus(client.userId));
    return "OK";
  }

  @SubscribeMessage('get-status')
  async handleGetStatus(
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<MatchmakingPlayerStatusDTO> {
    return this.matchmakingService.getPlayerStatus(client.userId);
  }

  @Public()
  @SubscribeMessage('authorization')
  async handleAuthorization(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() token: string,
  ): Promise<string> {
    client.handshake.auth.token = token;
    return "OK";
  }
}

function getSyncRoom(socket: AuthedSocket): string {
  return "matchmaking-sync-" + socket.userId.toString();
}
