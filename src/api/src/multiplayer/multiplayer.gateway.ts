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
import { AuthedSocket } from "../auth/types/auth.types";
import { WsAuthGuard } from "../auth/guards/ws.auth.guard";
import { Public } from "../auth/guards/PublicDecorator";
import { MultiplayerService } from "./multiplayer.service";
import { BallUpdate, MovementUpdate } from "./types/multiplayer.types";
import { UseGuards } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { UserService } from '../user/user.service';
import { APIError } from "../utils/errors";

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/multiplayer',
})
export class MultiplayerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly multiplayerService: MultiplayerService,
    private userService: UserService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.multiplayerService.setServer(server);

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.authService)) {
        console.log('An authorized user connected to the multiplayer server');
        next();
      } else {
        console.log(
          'An unauthorized user tried to connect to the multiplayer server',
        );
        socket.emit('unauthorized');
        next(new WsException('Unauthorized'));
      }
    });
  }

  handleConnection(client: AuthedSocket): void {
    console.log('A user connected to the multiplayer server');
  }

  async handleDisconnect(client: AuthedSocket): Promise<void> {
    console.log('A user disconnected from the multiplayer server');
    const user = await this.userService.findByID(client.userId);
    if (user.isErr()) return;

    await this.userService.updateUserGameStatus(user.value);
    await this.multiplayerService.disconnectPlayerFromGame(client);
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

  @SubscribeMessage('quit')
  async handleQuit(@ConnectedSocket() client: AuthedSocket): Promise<string> {
    console.log("A user quit the game: ", client.userId);
    await this.multiplayerService.disconnectPlayerFromGame(client);
    return "OK";
  }

  @SubscribeMessage('ready')
  async handleReady(@ConnectedSocket() client: AuthedSocket): Promise<string> {
    const result = await this.multiplayerService.setClientReady(client);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.GameNotFound:
          return "Game not found";
      }
    }
    return "OK";
  }

  @SubscribeMessage('update-movement')
  async handleUpdateMovement(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: MovementUpdate,
  ): Promise<string> {
    this.multiplayerService.processMovementUpdate(client, data);
    return "OK";
  }

  @SubscribeMessage('update-ball')
  async handleUpdateBall(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: BallUpdate,
  ): Promise<string> {
    this.multiplayerService.processBallUpdate(client, data);
    return "OK";
  }

  @SubscribeMessage('goal')
  async handleGoal(@ConnectedSocket() client: AuthedSocket): Promise<string> {
    await this.multiplayerService.processGoal(client);
    return "OK";
  }
}
