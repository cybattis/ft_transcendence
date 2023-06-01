import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MatchmakingService } from "./matchmaking.service";
import { UserService } from "../user/user.service";
import { CasualMatchmakingPlayer, RankedMatchmakingPlayer } from "./types/matchmaking.type";
import { ModuleRef } from "@nestjs/core";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { UseGuards } from "@nestjs/common";

@UseGuards(WsAuthGuard)
@WebSocketGateway({cors: {origin: '*', methods: ["GET", "POST"]}})
export class MatchmakingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userService: UserService;

  constructor(private matchmakingService: MatchmakingService,
              private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.userService = this.moduleRef.get(UserService, {strict: false});
  }

  handleConnection(socket: Socket) {
    // TODO: verify the JWT token
    console.log("A user connected to the matchmaking server");
  }

  handleDisconnect(socket: Socket) {
    console.log("A user disconnected from the matchmaking server");
  }

  @SubscribeMessage('join-matchmaking-casual')
  async handleJoinMatchmakingCasual(@ConnectedSocket() client: Socket, @MessageBody('playerId') playerId: number) {
    // TODO: verify the JWT token
    // TODO: verify that the user is not already in the matchmaking
    // TODO: verify that the user is not already in a game
    // TODO: use a dedicated function to check if the user exists in the database

    const user = await this.userService.findByID(playerId);

    // If the user was found, join the matchmaking
    if (user) {
      const matchmakingPlayer: CasualMatchmakingPlayer = {socket: client, id: playerId};
      await this.matchmakingService.joinMatchmakingCasual(matchmakingPlayer);
    } else {
      // If the user was not found, send an error message
      throw new WsException("Couldn't authenticate the user");
    }
  }

  @SubscribeMessage('leave-matchmaking-casual')
  async handleLeaveMatchmakingCasual(@ConnectedSocket() client: Socket, @MessageBody('playerId') playerId: number) {
    // TODO: verify the JWT token
    // TODO: verify that the user is already in the matchmaking
    // TODO: use a dedicated function to check if the user exists in the database
    await this.userService.findByID(playerId).then(user => {

      // If the user was found, join the matchmaking
      if (user) {
        const matchmakingPlayer: CasualMatchmakingPlayer = {socket: client, id: playerId};
        this.matchmakingService.leaveMatchmakingCasual(matchmakingPlayer);
      } else {
        // If the user was not found, send an error message
        throw new WsException("Couldn't authenticate the user");
      }

    }).catch(e => {
      // If an error occurred, send an error message
      throw new WsException("Couldn't authenticate the user");
    });
  }

  @SubscribeMessage('join-matchmaking-ranked')
  async handleJoinMatchmakingRanked(@ConnectedSocket() client: Socket, @MessageBody('playerId') playerId: number) {
    // TODO: verify the JWT token
    // TODO: verify that the user is not already in the matchmaking
    // TODO: verify that the user is not already in a game
    // TODO: use a dedicated function to check if the user exists in the database
    const user = await this.userService.findByID(playerId);

    // If the user was found, join the matchmaking
    if (user) {
      const matchmakingPlayer: RankedMatchmakingPlayer = {socket: client, id: playerId, rankPoints: user.ranking};
      await this.matchmakingService.joinMatchmakingRanked(matchmakingPlayer);
    } else {
      // If the user was not found, send an error message
      throw new WsException("Couldn't authenticate the user");
    }
  }

  @SubscribeMessage('leave-matchmaking-ranked')
  async handleLeaveMatchmakingRanked(@ConnectedSocket() client: Socket, @MessageBody('playerId') playerId: number) {
    // TODO: verify the JWT token
    // TODO: verify that the user is already in the matchmaking
    // TODO: use a dedicated function to check if the user exists in the database
    await this.userService.findByID(playerId).then(user => {

      // If the user was found, join the matchmaking
      if (user) {
        const matchmakingPlayer: RankedMatchmakingPlayer = {socket: client, id: playerId, rankPoints: user.ranking};
        this.matchmakingService.leaveMatchmakingRanked(matchmakingPlayer);
      } else {
        // If the user was not found, send an error message
        throw new WsException("Couldn't authenticate the user");
      }

    }).catch(e => {
      // If an error occurred, send an error message
      throw new WsException("Couldn't authenticate the user");
    });
  }

}