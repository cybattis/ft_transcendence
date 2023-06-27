import { Injectable } from "@nestjs/common";
import { GameRoom } from "./types/multiplayer.types";
import { GameService } from "../game/game.service";
import { UserService } from "../user/user.service";
import { Game } from "../game/entity/Game.entity";
import { AuthedSocket } from "../auth/types/auth.types";
import { GameStatus } from "../type/game.type";
import { Server } from "socket.io";

@Injectable()
export class MultiplayerService {
  private readonly rooms: GameRoom[] = [];
  private server: Server;

  constructor(private readonly gameService: GameService,
              private readonly userService: UserService) {}

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
  public createRoom(gameInfos: Game, player1Id: number, player2Id: number): void {

    const gameRoom: GameRoom = {
      id: gameInfos.id,
      player1Id: player1Id,
      player2Id: player2Id,
      type: gameInfos.type,
      mode: gameInfos.mode,
      status: gameInfos.status,
      player1Score: gameInfos.scoreP1,
      player2Score: gameInfos.scoreP2,
      player1Ready: false,
      player2Ready: false
    };

    this.rooms.push(gameRoom);
  }

  /*
    * Set the player ready so that the game can begin
    *
    * @param client The client that sent the ready event
   */
  public setClientReady(client: AuthedSocket): void {
    const room = this.getRoomByPlayerId(client.userId);
    if (room) {
      if (room.player1Id === client.userId)
        room.player1Ready = true;
      else
        room.player2Ready = true;

      client.join("game-" + room.id.toString());

      if (room.player1Ready && room.player2Ready) {
        this.startGame(room);
      }
    }
  }

  /*
    * Start a game
    *
    * @param game The game to start
   */
  public startGame(game: GameRoom): void {
    game.status = GameStatus.IN_PROGRESS;
    this.server.to("game-" + game.id.toString()).emit("game-start", game);
  }

  /*
    * Get the room of a player
    *
    * @param playerId The id of the player
   */
  public getRoomByPlayerId(playerId: number): GameRoom | undefined {
    return this.rooms.find(room => room.player1Id === playerId || room.player2Id === playerId);
  }
}