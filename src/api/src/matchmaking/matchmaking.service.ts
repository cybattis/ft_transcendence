import { Injectable } from "@nestjs/common";
import { CasualMatchmakingPlayer, RankedMatchmakingPlayer } from "./types/matchmaking.type";
import { GameService } from "../game/game.service";
import { GameBodyDto, GameMode, GameStatus, GameType } from "../type/game.type";
import { UserService } from "../user/user.service";
import { User } from "../user/entity/Users.entity";
import { Socket } from "socket.io";
import { Game } from "../game/entity/Game.entity";
import { MultiplayerService } from "../multiplayer/multiplayer.service";

@Injectable()
export class MatchmakingService {

  private casualMatchmakingQueue: CasualMatchmakingPlayer[] = [];
  private rankedMatchmakingQueue: RankedMatchmakingPlayer[] = [];

  constructor(private readonly gameService: GameService,
              private readonly userService: UserService,
              private readonly multiplayerService: MultiplayerService) {}

  /*
    == API ==
   */

  /*
   * Add a player to the casual matchmaking queue
   *
   * @param socket The socket of the player
   * @param playerId The id of the player
   */
  public async joinMatchmakingCasual(socket: Socket, playerId: number): Promise<boolean> {

    // Find the player in the database
    const user: User | null = await this.getUserFromDb(playerId);

    // If the player was not found, return
    if (!user) return false;

    // Create a new player object
    const player: CasualMatchmakingPlayer = {socket: socket, id: playerId};

    // Make him join the matchmaking
    await this.addPlayerToCasualQueue(player);

    console.log("A registered player joined the casual matchmaking server");
    return true;
  }

  /*
   * Remove a player from the casual matchmaking queue
   *
   * @param playerId The id of the player
   */
  public leaveMatchmakingCasual(playerId: number): void {
    // If the player is in the ranked matchmaking queue, remove him
    const player: CasualMatchmakingPlayer | undefined = this.findPlayerInCasualMatchmaking(playerId);
    if (player) {
      this.removePlayerFromCasualQueue(player);
      console.log("A registered player left the casual matchmaking server");
    }
  }

  /*
    * Add a player to the ranked matchmaking queue
    *
    * @param socket The socket of the player
    * @param playerId The id of the player
   */
  public async joinMatchmakingRanked(socket: Socket, playerId: number): Promise<boolean> {

    // Find the player in the database
    const user: User | null = await this.getUserFromDb(playerId);

    // If the player was not found, return
    if (!user) return false;

    // Create a new player object
    const player: RankedMatchmakingPlayer = {socket: socket, id: playerId, rankPoints: user.ranking};

    // Make him join the matchmaking
    await this.addPlayerToRankedQueue(player);

    console.log("A registered player joined the ranked matchmaking server");
    return true;
  }

  /*
    * Remove a player from the ranked matchmaking queue
    *
    * @param playerId The id of the player
   */
  public leaveMatchmakingRanked(playerId: number): void {
    // If the player is in the ranked matchmaking queue, remove him
    const player: RankedMatchmakingPlayer | undefined = this.findPlayerInRankedMatchmaking(playerId);
    if (player) {
      this.removePlayerFromRankedQueue(player);
      console.log("A registered player left the ranked matchmaking server");
    }
  }

  /*
    * Makes the player leave any matchmaking queues he is in
    *
    * @param playerId The id of the player
   */
  public leaveMatchmaking(playerId: number): void {
    this.leaveMatchmakingCasual(playerId);
    this.leaveMatchmakingRanked(playerId);
  }

  /*
    == Implementation ==
   */

  private async addPlayerToCasualQueue(player: CasualMatchmakingPlayer): Promise<void> {
    if (this.isPlayerInCasualMatchmaking(player)) return;

    // If there is at least one player in the queue, match them together
    if (this.casualMatchmakingQueue.length >= 1) {
      await this.createCasualGame(this.casualMatchmakingQueue[0], player);
      this.removePlayerFromCasualQueue(this.casualMatchmakingQueue[0]);
      return;
    }

    // Else add the player to the queue
    this.casualMatchmakingQueue.push(player);
  }

  private isPlayerInCasualMatchmaking(player: CasualMatchmakingPlayer): boolean {
    return this.casualMatchmakingQueue.find((p) => p.id === player.id) !== undefined;
  }

  private removePlayerFromCasualQueue(player: CasualMatchmakingPlayer): void {
    const index: number = this.indexOfPlayerInCasualMatchmaking(player.id);
    this.casualMatchmakingQueue.splice(index, 1);
  }

  private async addPlayerToRankedQueue(player: RankedMatchmakingPlayer): Promise<void> {
    // TODO: match players based on their rank

    if (this.isPlayerInRankedMatchmaking(player)) return;

    // If there is at least one player in the queue, match them together
    if (this.rankedMatchmakingQueue.length >= 1) {
      await this.createRankedGame(this.rankedMatchmakingQueue[0], player);
      this.removePlayerFromRankedQueue(this.rankedMatchmakingQueue[0]);
      return;
    }

    // Else add the player to the queue
    this.rankedMatchmakingQueue.push(player);
  }

  private isPlayerInRankedMatchmaking(player: RankedMatchmakingPlayer): boolean {
    return this.rankedMatchmakingQueue.find((p) => p.id === player.id) !== undefined;
  }

  private removePlayerFromRankedQueue(player: RankedMatchmakingPlayer): void {
    const index: number = this.indexOfPlayerInRankedMatchmaking(player.id);
    this.rankedMatchmakingQueue.splice(index, 1);
  }

  private async createCasualGame(player1: CasualMatchmakingPlayer, player2: CasualMatchmakingPlayer): Promise<boolean> {
    // TODO: do this in the MatchService
    const gameDto: GameBodyDto = {
      type: GameType.CASUAL,
      mode: GameMode.V1,
      ids: [player1.id, player2.id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.IN_PROGRESS,
    };

    try {
      const newGame: Game = await this.gameService.createGame(gameDto);
      this.multiplayerService.createRoom(newGame, player1.id, player2.id);
      console.log("Casual game created");
      return true;
    } catch (e) {
      return false;
    }
  }

  private async createRankedGame(player1: RankedMatchmakingPlayer, player2: RankedMatchmakingPlayer): Promise<boolean> {
    // TODO: do this in the MatchService
    const gameDto: GameBodyDto = {
      type: GameType.RANKED,
      mode: GameMode.V1,
      ids: [player1.id, player2.id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.IN_PROGRESS,
    };

    try {
      const newGame: Game = await this.gameService.createGame(gameDto);
      this.multiplayerService.createRoom(newGame, player1.id, player2.id);
      console.log("Ranked game created");
      return true;
    } catch (e) {
      return false;
    }
  }

  private indexOfPlayerInCasualMatchmaking(playerId: number): number {
    return this.casualMatchmakingQueue.findIndex((p) => p.id === playerId);
  }

  private indexOfPlayerInRankedMatchmaking(playerId: number): number {
    return this.rankedMatchmakingQueue.findIndex((p) => p.id === playerId);
  }

  private findPlayerInCasualMatchmaking(playerId: number): CasualMatchmakingPlayer | undefined {
    return this.casualMatchmakingQueue.find((p) => p.id === playerId);
  }

  private findPlayerInRankedMatchmaking(playerId: number): RankedMatchmakingPlayer | undefined {
    return this.rankedMatchmakingQueue.find((p) => p.id === playerId);
  }

  private async getUserFromDb(playerId: number): Promise<User | null> {
    return await this.userService.findByID(playerId);
  }
}
