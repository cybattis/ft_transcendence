import { Injectable } from "@nestjs/common";
import { GameRoom } from "./types/multiplayer.types";
import { GameService } from "../game/game.service";
import { UserService } from "../user/user.service";
import { Game } from "../game/entity/Game.entity";

@Injectable()
export class MultiplayerService {
  private readonly rooms: GameRoom[] = [];

  constructor(private readonly gameService: GameService,
              private readonly userService: UserService) {}

  /*
    * == API ==
   */

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
    };

    this.rooms.push(gameRoom);
  }
}