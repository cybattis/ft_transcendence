import { Injectable } from '@nestjs/common';
import {
  BallUpdate,
  GameRoom,
  MovementUpdate,
  ScoreUpdate,
  ServeUpdate,
} from './types/multiplayer.types';
import { GameService } from '../game/game.service';
import { Game } from '../game/entity/Game.entity';
import { AuthedSocket } from '../auth/types/auth.types';
import { GameStatus } from '../type/game.type';
import { Server } from 'socket.io';
import { UserService } from '../user/user.service';

@Injectable()
export class MultiplayerService {
  private readonly rooms: GameRoom[] = [];
  private server: Server;

  // Game constants
  private readonly BALL_SPEED: number = 0.5; // Traveling half of the board in 1 second
  private readonly BALL_SERVING_SPEED: number = this.BALL_SPEED / 2; // 50% of the normal speed

  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {
    console.log('[MULTIPLAYER] Service initialized');
  }

  /*
   * == API ==
   */

  /*
   * Set the server
   *
   * @param server The server
   */
  public setServer(server: Server): void {
    this.server = server;
  }

  /*
   * Create a new game room
   *
   * @param gameInfos The game infos returned by the game service
   * @param player1Id The id of the first player
   * @param player2Id The id of the second player
   */
  public createRoom(
    gameInfos: Game,
    player1Id: number,
    player2Id: number,
  ): void {
    const gameRoom: GameRoom = {
      id: gameInfos.id,
      serverRoomId: 'game-' + gameInfos.id.toString(),
      player1Id: player1Id,
      player2Id: player2Id,
      type: gameInfos.type,
      mode: gameInfos.mode,
      status: gameInfos.status,
      player1Score: gameInfos.scoreP1,
      player2Score: gameInfos.scoreP2,
      player1Ready: false,
      player2Ready: false,
      player1Disconnected: false,
      player2Disconnected: false,
      isServing: false,
    };

    this.rooms.push(gameRoom);
    console.log('[MULTIPLAYER] Room created: ' + gameRoom.id);
  }

  /*
   * Set the player ready so that the game can begin
   *
   * @param client The client that sent the ready event
   */
  public async setClientReady(client: AuthedSocket): Promise<void> {
    const room = this.getRoomByPlayerId(client.userId);
    if (room) {
      if (room.player1Id === client.userId) {
        room.player1Ready = true;
        client.emit('ready-ack', 1);
      } else if (room.player2Id === client.userId) {
        room.player2Ready = true;
        client.emit('ready-ack', 2);
      } else {
        return;
      }

      client.join(room.serverRoomId);

      console.log('[MULTIPLAYER] Player ' + client.userId + ' is ready.');

      if (room.player1Ready && room.player2Ready) {
        await this.startGame(room);
      }
    } else {
      console.log('NO ROOM FOUND FOR PLAYER ' + client.userId);
      console.log(this.rooms);
    }
  }

  /*
   * Start a game
   *
   * @param game The game to start
   */
  public async startGame(game: GameRoom): Promise<void> {
    game.status = GameStatus.IN_PROGRESS;
    await this.gameService.updateGameStatus(game.id, GameStatus.IN_PROGRESS);

    const ballUpdate: BallUpdate = {
      x: 0.5,
      y: 0.5,
      velX: 0,
      velY: 0,
    };

    let playerNumber: number = 0;
    // Serve the ball
    if (Math.random() > 0.5) {
      const direction = (Math.random() * Math.PI) / 2 - Math.PI / 4; // Right
      ballUpdate.velX = Math.cos(direction) * this.BALL_SERVING_SPEED;
      ballUpdate.velY = Math.sin(direction) * this.BALL_SERVING_SPEED;
      playerNumber = 2;
    } else {
      const direction = (Math.random() * Math.PI) / 2 + (Math.PI * 3) / 4; // Left
      ballUpdate.velX = Math.cos(direction) * this.BALL_SERVING_SPEED;
      ballUpdate.velY = Math.sin(direction) * this.BALL_SERVING_SPEED;
      playerNumber = 1;
    }

    game.isServing = true;

    const serveUpdate: ServeUpdate = {
      playerNumber: playerNumber,
      ballUpdate: ballUpdate,
    };

    this.server
      .to(game.serverRoomId)
      .emit('game-start', serveUpdate);

    console.log('[MULTIPLAYER] Game ' + game.id.toString() + ' started.');
  }

  /*
   * Get the room of a player
   *
   * @param playerId The id of the player
   */
  public getRoomByPlayerId(playerId: number): GameRoom | undefined {
    return this.rooms.find(
      (room) => room.player1Id === playerId || room.player2Id === playerId,
    );
  }

  /*
   * Process a movement update
   *
   * @param client The client that sent the update
   * @param update The update
   */
  public processMovementUpdate(
    client: AuthedSocket,
    update: MovementUpdate,
  ): void {
    const game: GameRoom | undefined = this.getRoomByPlayerId(client.userId);
    if (!game) return;

    client.broadcast
      .to(game.serverRoomId)
      .emit('update-movement', update);
  }

  /*
   * Process a ball update
   *
   * @param client The client that sent the update
   * @param update The update
   */
  public processBallUpdate(client: AuthedSocket, update: BallUpdate): void {
    const game: GameRoom | undefined = this.getRoomByPlayerId(client.userId);
    if (!game) return;

    // Send the update to all players and spectators
    client.broadcast
      .to(game.serverRoomId)
      .emit('update-ball', update);
  }

  /*
   * Process a score update
   *
   * @param client The client that sent the update
   */
  public async processGoal(client: AuthedSocket): Promise<void> {
    const game: GameRoom | undefined = this.getRoomByPlayerId(client.userId);
    if (!game) return;

    // Update the score of the right player
    // The player that sent the goal event is the player that lost the point
    if (client.userId === game.player1Id) game.player2Score++;
    else if (client.userId === game.player2Id) game.player1Score++;

    const scoreUpdate: ScoreUpdate = {
      player1Score: game.player1Score,
      player2Score: game.player2Score,
    };

    // Send the updated score to all players and spectators
    this.server
      .to(game.serverRoomId)
      .emit('update-score', scoreUpdate);
    console.log('[MULTIPLAYER] Score updated for game ' + game.id.toString());

    // Reset the ball position
    const ballUpdate: BallUpdate = {
      x: 0.5,
      y: 0.5,
      velX: 0,
      velY: 0,
    };

    this.server
      .to(game.serverRoomId)
      .emit('update-ball', ballUpdate);

    // Update the game in the database
    await this.gameService.updateGameScore(game.id, scoreUpdate);

    // Check if the game is finished
    if (
      (game.player1Score >= 11 && game.player1Score - game.player2Score >= 2) ||
      (game.player2Score >= 11 && game.player2Score - game.player1Score >= 2)
    ) {
      await this.endGame(game);
      return;
    }

    let playerNumber: number = 0;
    // Serve the ball
    if (client.userId === game.player1Id) {
      const direction = (Math.random() * Math.PI) / 2 - Math.PI / 4; // Right
      ballUpdate.velX = Math.cos(direction) * this.BALL_SERVING_SPEED;
      ballUpdate.velY = Math.sin(direction) * this.BALL_SERVING_SPEED;
      playerNumber = 2;
    } else if (client.userId === game.player2Id) {
      const direction = (Math.random() * Math.PI) / 2 + (Math.PI * 3) / 4; // Left
      ballUpdate.velX = Math.cos(direction) * this.BALL_SERVING_SPEED;
      ballUpdate.velY = Math.sin(direction) * this.BALL_SERVING_SPEED;
      playerNumber = 1;
    }

    game.isServing = true;

    // Send the ball update to all players and spectators
    const serveUpdate: ServeUpdate = {
      ballUpdate: ballUpdate,
      playerNumber: playerNumber,
    };

    this.server.to(game.serverRoomId).emit('serve', serveUpdate);
  }

  /*
   * End a game
   *
   * @param game The game to end
   */
  public async endGame(game: GameRoom): Promise<void> {
    // If the game is already finished, don't do anything
    if (game.status === GameStatus.FINISHED) return;

    // Update the game status
    if (game.player1Disconnected || game.player2Disconnected)
      game.status = GameStatus.PLAYER_DISCONNECTED;
    else
      game.status = GameStatus.FINISHED;

    // Send the end event to all players and spectators
    this.server.to(game.serverRoomId).emit('game-ended');

    // Remove all players from the room
    this.server.socketsLeave(game.serverRoomId);

    console.log('[MULTIPLAYER] Game ' + game.id.toString() + ' ended');

    // Update the game in the database
    await this.gameService.updateGameStatus(game.id, game.status);

    // Update the stats of the players
    const user1 = await this.userService.findByID(game.player1Id);
    const user2 = await this.userService.findByID(game.player2Id);

    const score = { u1: game.player1Score, u2: game.player2Score };

    if (user1.isOk() && user2.isOk()) {
      const u1 = user1.value;
      const u2 = user2.value;
      if (game.player1Disconnected)
        await this.gameService.updateUserStats(u2, u1, game.type, score);
      else if (game.player2Disconnected)
        await this.gameService.updateUserStats(u1, u2, game.type, score);
      else if (game.player1Score > game.player2Score)
        await this.gameService.updateUserStats(u1, u2, game.type, score);
      else
        await this.gameService.updateUserStats(u2, u1, game.type, score);
    }

    // Remove the game from the list
    const index: number = this.rooms.indexOf(game);
    if (index !== -1) this.rooms.splice(index, 1);
  }

  /*
   * Process a disconnection
   *
   * @param client The client that disconnected
   */
  public async disconnectPlayerFromGame(client: AuthedSocket): Promise<void> {
    // Remove the player from the game
    const game: GameRoom | undefined = this.getRoomByPlayerId(client.userId);
    if (game) {
      // If the game is already finished, don't do anything
      if (game.status === GameStatus.FINISHED) return;

      // Update the game
      if (game.player1Id === client.userId)
        game.player1Disconnected = true;
      else
        game.player2Disconnected = true;

      console.log(
        '[MULTIPLAYER] Player ' +
          client.userId.toString() +
          ' disconnected from game ' +
          game.id.toString(),
      );

      // If the game is not finished, end it
      await this.endGame(game);
    }
  }

  public isPlayerInGame(playerId: number): boolean {
    const game: GameRoom | undefined = this.getRoomByPlayerId(playerId);
    return game !== undefined;
  }
}
