import {Injectable} from "@nestjs/common";
import {
  CasualMatchmakingPlayer,
  PendingCasualGame,
  PendingRankedGame,
  RankedMatchmakingPlayer
} from "./types/matchmaking.type";
import {GameService} from "../game/game.service";
import {GameBodyDto, GameMode, GameStatus, GameType} from "../type/game.type";
import {UserService} from "../user/user.service";
import {User} from "../user/entity/Users.entity";
import {Socket} from "socket.io";
import {MultiplayerService} from "../multiplayer/multiplayer.service";
import {APIError} from "src/utils/errors";
import {failure, Result, success} from "../utils/Error";

@Injectable()
export class MatchmakingService {

  private casualMatchmakingQueue: CasualMatchmakingPlayer[] = [];
  private rankedMatchmakingQueue: RankedMatchmakingPlayer[] = [];

  private pendingCasualGames: PendingCasualGame[] = [];
  private pendingRankedGames: PendingRankedGame[] = [];

  private readonly matchAcceptTimeout: number = 5; // 30 seconds

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
    const user = await this.getUserFromDb(playerId);

    // If the player was not found, return
    if (user.isErr()) return false;

    // Check if the user is already in game
    if (this.multiplayerService.isPlayerInGame(playerId)) return false;

    // Create a new player object
    const player: CasualMatchmakingPlayer = {socket: socket, id: playerId};

    // Check if the user is already in matchmaking
    if (this.isPlayerInCasualMatchmaking(player)) return false;

    // Make him join the matchmaking
    await this.addPlayerToCasualQueue(player);

    console.log("A registered player joined the casual matchmaking server. ID: ", playerId);
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
    const user = await this.getUserFromDb(playerId);

    // If the player was not found, return
    if (user.isErr()) return false;

    // Check if the user is already in game
    if (this.multiplayerService.isPlayerInGame(playerId)) return false;

    // Create a new player object
    const player: RankedMatchmakingPlayer = {socket: socket, id: playerId, rankPoints: user.value.ranking};

    // Check if the user is already in matchmaking
    if (this.isPlayerInRankedMatchmaking(player)) return false;

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
    * Tells the matchmaking server that a player is ready to join the game he was invited to
    *
    * @param playerId The id of the player
   */
  public async acceptFoundGame(playerId: number): Promise<void> {
    const pendingCasualGame: PendingCasualGame | undefined = this.findPendingCasualGame(playerId);
    const pendingRankedGame: PendingRankedGame | undefined = this.findPendingRankedGame(playerId);

    console.log("Player " + playerId + " accepted the game");
    if (pendingCasualGame) {

      // Set the player as ready
      if (pendingCasualGame.player1.id === playerId) {
        pendingCasualGame.player1Ready = true;
      } else if (pendingCasualGame.player2.id === playerId) {
        pendingCasualGame.player2Ready = true;
      }

      // TODO: return error if game creation fails
      // If both players are ready, create the game
      if (pendingCasualGame.player1Ready && pendingCasualGame.player2Ready) {
        // Retreiving the players from the database
        const player1 = await this.getUserFromDb(pendingCasualGame.player1.id);
        const player2 = await this.getUserFromDb(pendingCasualGame.player2.id);

        if (player1.isErr() || player2.isErr())
          return;

        const player1Infos = {
          id: player1.value.id,
          nickname: player1.value.nickname,
          paddleColor: player1.value.paddleColor,
        };

        const player2Infos = {
          id: player2.value.id,
          nickname: player2.value.nickname,
          paddleColor: player2.value.paddleColor,
        };

        // Sending the game start event to the players
        pendingCasualGame.player1.socket.emit("game-started", player2Infos);
        pendingCasualGame.player2.socket.emit("game-started", player1Infos);
        await this.createCasualGame(pendingCasualGame.player1, pendingCasualGame.player2);
        this.removePendingCasualGame(pendingCasualGame);
      }
    } else if (pendingRankedGame) {
      console.log("Player " + playerId + " accepted the ranked game");

      // Set the player as ready
      if (pendingRankedGame.player1.id === playerId) {
        pendingRankedGame.player1Ready = true;
      } else if (pendingRankedGame.player2.id === playerId) {
        pendingRankedGame.player2Ready = true;
      }

      // If both players are ready, create the game
      if (pendingRankedGame.player1Ready && pendingRankedGame.player2Ready) {
        // Retreiving the players from the database
        const player1 = await this.getUserFromDb(pendingRankedGame.player1.id);
        const player2 = await this.getUserFromDb(pendingRankedGame.player2.id);

        if (player1.isErr() || player2.isErr())
          return;

        const player1Infos = {
          id: player1.value.id,
          nickname: player1.value.nickname,
          paddleColor: player1.value.paddleColor,
        };

        const player2Infos = {
          id: player2.value.id,
          nickname: player2.value.nickname,
          paddleColor: player2.value.paddleColor,
        };

        pendingRankedGame.player1.socket.emit("game-started", player2Infos);
        pendingRankedGame.player2.socket.emit("game-started", player1Infos);
        await this.createRankedGame(pendingRankedGame.player1, pendingRankedGame.player2);
        this.removePendingRankedGame(pendingRankedGame);
      }
    }
  }

  /*
    == Implementation ==
   */

  private async addPlayerToCasualQueue(player: CasualMatchmakingPlayer): Promise<void> {
    // If there is at least one player in the queue, match them together
    if (this.casualMatchmakingQueue.length >= 1) {
      this.invitePlayersToCasualGame(this.casualMatchmakingQueue[0], player);
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
    if (index >= 0)
      this.casualMatchmakingQueue.splice(index, 1);
  }

  private async addPlayerToRankedQueue(player: RankedMatchmakingPlayer): Promise<void> {
    // TODO: match players based on their rank
    // If there is at least one player in the queue, match them together
    if (this.rankedMatchmakingQueue.length >= 1) {
      this.invitePlayersToRankedGame(this.rankedMatchmakingQueue[0], player);
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
    if (index >= 0)
      this.rankedMatchmakingQueue.splice(index, 1);
  }

  private invitePlayersToCasualGame(player1: CasualMatchmakingPlayer, player2: CasualMatchmakingPlayer): void {
    const pendingGame: PendingCasualGame = {
      player1: player1,
      player1Ready: false,
      player2: player2,
      player2Ready: false,
      creationDate: new Date(),
    };

    this.pendingCasualGames.push(pendingGame);

    // If the players don't accept the game in 30 seconds, remove it
    setTimeout(() => {
      this.removePendingCasualGame(pendingGame);
    }, this.matchAcceptTimeout * 1000);

    // Send the invitation to the players
    player1.socket.emit("match-found", this.matchAcceptTimeout);
    player2.socket.emit("match-found", this.matchAcceptTimeout);
  }

  private findPendingCasualGame(playerId: number): PendingCasualGame | undefined {
    return this.pendingCasualGames.find((g) => g.player1.id === playerId || g.player2.id === playerId);
  }

  private removePendingCasualGame(pendingGame: PendingCasualGame): void {
    const index: number = this.pendingCasualGames.indexOf(pendingGame);
    if (index >= 0)
      this.pendingCasualGames.splice(index, 1);
  }

  private invitePlayersToRankedGame(player1: RankedMatchmakingPlayer, player2: RankedMatchmakingPlayer): void {
    const pendingGame: PendingRankedGame = {
      player1: player1,
      player1Ready: false,
      player2: player2,
      player2Ready: false,
      creationDate: new Date(),
    };

    this.pendingRankedGames.push(pendingGame);

    // If the players don't accept the game in 30 seconds, remove it
    setTimeout(() => {
      this.removePendingRankedGame(pendingGame);
    }, this.matchAcceptTimeout * 1000);

    // Send the invitation to the players
    player1.socket.emit("match-found", this.matchAcceptTimeout);
    player2.socket.emit("match-found", this.matchAcceptTimeout);
  }

  private findPendingRankedGame(playerId: number): PendingRankedGame | undefined {
    return this.pendingRankedGames.find((g) => g.player1.id === playerId || g.player2.id === playerId);
  }

  private removePendingRankedGame(pendingGame: PendingRankedGame): void {
    const index: number = this.pendingRankedGames.indexOf(pendingGame);
    if (index >= 0)
      this.pendingRankedGames.splice(index, 1);
  }

  private async createCasualGame(player1: CasualMatchmakingPlayer, player2: CasualMatchmakingPlayer): Promise<boolean> {
    // TODO: do this in the MatchService
    const gameDto: GameBodyDto = {
      type: GameType.CASUAL,
      mode: GameMode.V1,
      ids: [player1.id, player2.id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.WAITING_FOR_PLAYERS,
    };

    try {
      const newGame = await this.gameService.createGame(gameDto);
      if (newGame.isErr())
        return false;
      this.multiplayerService.createRoom(newGame.value, player1.id, player2.id);
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
      status: GameStatus.WAITING_FOR_PLAYERS,
    };

    try {
      const newGame = await this.gameService.createGame(gameDto);
      if (newGame.isErr())
        return false;
      this.multiplayerService.createRoom(newGame.value, player1.id, player2.id);
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

  private async getUserFromDb(playerId: number): Promise<Result<User, typeof APIError.UserNotFound>> {
    const result = await this.userService.findByID(playerId);
    if (result.isErr()) return failure(APIError.UserNotFound);
    return success(result.value);
  }
}
