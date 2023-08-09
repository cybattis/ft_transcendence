import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthedSocket } from '../auth/types/auth.types';
import { WsAuthGuard } from '../auth/guards/ws.auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../auth/guards/PublicDecorator';
import { MultiplayerService } from './multiplayer.service';
import { BallUpdate, MovementUpdate } from './types/multiplayer.types';
import { UserService } from '../user/user.service';

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
    private readonly jwtService: JwtService,
    private readonly multiplayerService: MultiplayerService,
    private userService: UserService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.multiplayerService.setServer(server);

    this.server.use((socket: AuthedSocket, next) => {
      if (WsAuthGuard.validateSocketToken(socket, this.jwtService)) {
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
    if (!user) return;

    await this.userService.updateUserGameStatus(user);

    //await this.multiplayerService.disconnectPlayerFromGame(client);
  }

  @Public()
  @SubscribeMessage('authorization')
  async handleAuthorization(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() token: string,
  ): Promise<void> {
    client.handshake.auth.token = token;
  }

  @SubscribeMessage('quit')
  async handleQuit(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    //await this.multiplayerService.disconnectPlayerFromGame(client);
  }

  @SubscribeMessage('ready')
  async handleReady(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    this.multiplayerService.setClientReady(client);
  }

  @SubscribeMessage('update-movement')
  async handleUpdateMovement(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: MovementUpdate,
  ): Promise<void> {
    this.multiplayerService.processMovementUpdate(client, data);
  }

  @SubscribeMessage('update-ball')
  async handleUpdateBall(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: BallUpdate,
  ): Promise<void> {
    this.multiplayerService.processBallUpdate(client, data);
  }

  @SubscribeMessage('goal')
  async handleGoal(@ConnectedSocket() client: AuthedSocket): Promise<void> {
    await this.multiplayerService.processGoal(client);
  }
}
