import { Injectable } from "@nestjs/common";
import {
  CasualGameInvite,
  CasualMatchmakingPlayer,
  PendingCasualGame,
  PendingRankedGame,
  RankedGameInvite,
  RankedMatchmakingPlayer
} from "./types/matchmaking.type";
import { GameService } from "../game/game.service";
import { GameBodyDto, GameInvite, GameMode, GameStatus, GameType } from "../type/game.type";
import { UserService } from "../user/user.service";
import { User } from "../user/entity/Users.entity";
import { Socket } from "socket.io";
import { MultiplayerService } from "../multiplayer/multiplayer.service";
import { APIError } from "src/utils/errors";
import { failure, Result, success } from "../utils/Error";
import { ChannelService } from "../channel/channel.service";

@Injectable()
export class MatchmakingService {

  private casualMatchmakingQueue: CasualMatchmakingPlayer[] = [];
  private rankedMatchmakingQueue: RankedMatchmakingPlayer[] = [];

  private pendingCasualGames: PendingCasualGame[] = [];
  private pendingRankedGames: PendingRankedGame[] = [];

  private casualGameInvites: CasualGameInvite[] = [];
  private rankedGameInvites: RankedGameInvite[] = [];

  private readonly matchAcceptTimeout: number = 20; // 20 seconds

  constructor(private readonly gameService: GameService,
              private readonly userService: UserService,
              private readonly multiplayerService: MultiplayerService,
              private readonly channelService: ChannelService) {}

  /*
    == API ==
   */

  /*
   * Add a player to the casual matchmaking queue
   *
   * @param socket The socket of the player
   * @param playerId The id of the player
   */
  public async joinMatchmakingCasual(socket: Socket, playerId: number)
    : Promise<Result<true, typeof APIError.UserNotFound
    | typeof APIError.UserAlreadyInGame | typeof APIError.UserInMatchmaking>>
  {
    // Find the player in the database
    const user = await this.getUserFromDb(playerId);

    // If the player was not found, return
    if (user.isErr())
      return failure(APIError.UserNotFound);

    // Check if the user is already in game
    if (this.multiplayerService.isPlayerInGame(playerId))
      return failure(APIError.UserAlreadyInGame);

    // Check if the user is already in matchmaking
    if (this.isPlayerInMatchmaking(playerId))
      return failure(APIError.UserInMatchmaking);

    // Create a new player object
    const player: CasualMatchmakingPlayer = {socket: socket, id: playerId};

    // Make him join the matchmaking
    await this.addPlayerToCasualQueue(player);

    console.log("A registered player joined the casual matchmaking server. ID: ", playerId);
    return success(true);
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
  public async joinMatchmakingRanked(socket: Socket, playerId: number)
    : Promise<Result<true, typeof APIError.UserNotFound
    | typeof APIError.UserAlreadyInGame | typeof APIError.UserInMatchmaking>>
  {

    // Find the player in the database
    const user = await this.getUserFromDb(playerId);

    // If the player was not found, return
    if (user.isErr())
      return failure(APIError.UserNotFound);

    // Check if the user is already in game
    if (this.multiplayerService.isPlayerInGame(playerId))
      return failure(APIError.UserAlreadyInGame);

    // Check if the user is already in matchmaking
    if (this.isPlayerInMatchmaking(playerId))
      return failure(APIError.UserInMatchmaking);

    // Create a new player object
    const player: RankedMatchmakingPlayer = {socket: socket, id: playerId, rankPoints: user.value.ranking};

    // Make him join the matchmaking
    await this.addPlayerToRankedQueue(player);

    console.log("A registered player joined the ranked matchmaking server");
    return success(true);
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
  public async acceptFoundGame(playerId: number)
    : Promise<Result<true, typeof APIError.GameNotFound>>
  {
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

      // If both players are ready, create the game
      if (pendingCasualGame.player1Ready && pendingCasualGame.player2Ready) {
        await this.sendPlayersToCasualGame(
          pendingCasualGame.player1.id,
          pendingCasualGame.player1.socket,
          pendingCasualGame.player2.id,
          pendingCasualGame.player2.socket);

        this.removePendingCasualGame(pendingCasualGame);
      }
      return success(true);
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
        await this.sendPlayersToRankedGame(
          pendingRankedGame.player1.id,
          pendingRankedGame.player1.socket,
          pendingRankedGame.player2.id,
          pendingRankedGame.player2.socket);

        this.removePendingRankedGame(pendingRankedGame);
      }

      return success(true);
    }

    return failure(APIError.GameNotFound);
  }

  /*
    * Send an invitation to a player to join a casual game
    *
    * @param client The socket of the inviting player
    * @param invitingId The id of the inviting player
    * @param invitedId The id of the invited player
   */
  public async inviteUserToCasualGame(client: Socket, invitingId: number, invitedId: number)
    : Promise<Result<true, typeof APIError.UserNotFound | typeof APIError.UserAlreadyInGame
    | typeof APIError.OtherUserNotFound | typeof APIError.UserInMatchmaking>>
  {
    // Get the inviting user
    const invitingUser = await this.getUserFromDb(invitingId);
    if (invitingUser.isErr())
      return failure(APIError.UserNotFound);

    // If the inviting player is in game, return
    if (this.multiplayerService.isPlayerInGame(invitingId))
      return failure(APIError.UserAlreadyInGame);

    // If the inviting player is in matchmaking, return
    if (this.isPlayerInMatchmaking(invitingId))
      return failure(APIError.UserInMatchmaking);

    // Get the invited user
    const invitedUser = await this.getUserFromDb(invitedId);
    if (invitedUser.isErr())
      return failure(APIError.OtherUserNotFound);

    const invitingPlayer: CasualMatchmakingPlayer = {
      id: invitingId,
      socket: client,
    };

    const newGameInvite: CasualGameInvite = {
      invitedPlayerId: invitedId,
      invitingPlayer: invitingPlayer,
    };

    this.casualGameInvites.push(newGameInvite);
    await this.channelService.sendNotificationEvent(invitedId);
    return success(true);
  }

  /*
    * Accept an invitation to join a casual game
    *
    * @param client The socket of the invited player
    * @param invitedId The id of the invited player
    * @param invitingId The id of the inviting player
   */
  public async acceptCasualGameInvite(invitedSocket: Socket, invitedId: number, invitingId: number)
  : Promise<Result<true, typeof APIError.UserNotFound | typeof APIError.UserAlreadyInGame
    | typeof APIError.GameInviteNotFound | typeof APIError.OtherUserNotFound | typeof APIError.OtherUserAlreadyInGame
    | typeof APIError.UserInMatchmaking | typeof APIError.OtherUserInMatchmaking>>
  {
    // Get the invited user
    const invitedUser = await this.getUserFromDb(invitedId);
    if (invitedUser.isErr())
      return failure(APIError.UserNotFound);

    // If the invited player is in game, return
    if (this.multiplayerService.isPlayerInGame(invitedId))
      return failure(APIError.UserAlreadyInGame);

    // If the invited player is in matchmaking, return
    if (this.isPlayerInMatchmaking(invitedId))
      return failure(APIError.UserInMatchmaking);

    // Get the inviting user
    const invitingUser = await this.getUserFromDb(invitingId);
    if (invitingUser.isErr())
      return failure(APIError.OtherUserNotFound);

    // If the inviting player is in game, return
    if (this.multiplayerService.isPlayerInGame(invitingId))
      return failure(APIError.OtherUserAlreadyInGame);

    // If the inviting player is in matchmaking, return
    if (this.isPlayerInMatchmaking(invitingId))
      return failure(APIError.OtherUserInMatchmaking);

    const invite: CasualGameInvite | undefined = this.casualGameInvites.find((invite) => {
      return invite.invitedPlayerId === invitedId && invite.invitingPlayer.id === invitingId;
    });

    if (!invite)
      return failure(APIError.GameInviteNotFound);

    await this.sendPlayersToCasualGame(invitedId, invitedSocket, invitingId, invite.invitingPlayer.socket);
    this.casualGameInvites = this.casualGameInvites.filter((invite) => {
      return invite.invitedPlayerId !== invitedId || invite.invitingPlayer.id !== invitingId;
    });

    invite.invitingPlayer.socket.emit("game-invite-accepted");
    await this.channelService.sendNotificationEvent(invitingId);
    return success(true);
  }

  /*
    * Decline an invitation to join a casual game
    *
    * @param invitedId The id of the invited player
    * @param invitingId The id of the inviting player
   */
  public async declineCasualGameInvite(invitedId: number, invitingId: number): Promise<void> {
    this.casualGameInvites = this.casualGameInvites.filter((invite) => {
      return invite.invitedPlayerId !== invitedId || invite.invitingPlayer.id !== invitingId;
    });
    await this.channelService.sendNotificationEvent(invitingId);
  }

  /*
      * Send an invitation to a player to join a ranked game
      *
      * @param client The socket of the inviting player
      * @param invitingId The id of the inviting player
      * @param invitedId The id of the invited player
     */
  public async inviteUserToRankedGame(client: Socket, invitingId: number, invitedId: number)
  : Promise<Result<true, typeof APIError.UserNotFound | typeof APIError.UserAlreadyInGame
      | typeof APIError.OtherUserNotFound | typeof APIError.UserInMatchmaking>>
    {
      // Get the inviting user
      const invitingUser = await this.getUserFromDb(invitingId);
      if (invitingUser.isErr())
        return failure(APIError.UserNotFound);

      // If the inviting player is in game, return
      if (this.multiplayerService.isPlayerInGame(invitingId))
        return failure(APIError.UserAlreadyInGame);

      // If the inviting player is in matchmaking, return
      if (this.isPlayerInMatchmaking(invitingId))
        return failure(APIError.UserInMatchmaking);

      // Get the invited user
      const invitedUser = await this.getUserFromDb(invitedId);
      if (invitedUser.isErr())
        return failure(APIError.OtherUserNotFound);

      const invitingPlayer: RankedMatchmakingPlayer = {
        id: invitingId,
        socket: client,
        rankPoints: invitingUser.value.ranking,
      };

      const newGameInvite: RankedGameInvite = {
        invitedPlayerId: invitedId,
        invitingPlayer: invitingPlayer,
      };

      this.rankedGameInvites.push(newGameInvite);
      await this.channelService.sendNotificationEvent(invitedId);
      return success(true);
  }
  /*
  * Accept an invitation to join a ranked game
  *
  * @param client The socket of the invited player
  * @param invitedId The id of the invited player
  * @param invitingId The id of the inviting player
 */
  public async acceptRankedGameInvite(invitedSocket: Socket, invitedId: number, invitingId: number)
    : Promise<Result<true, typeof APIError.UserNotFound | typeof APIError.UserAlreadyInGame
    | typeof APIError.GameInviteNotFound | typeof APIError.OtherUserNotFound | typeof APIError.OtherUserAlreadyInGame
    | typeof APIError.UserInMatchmaking | typeof APIError.OtherUserInMatchmaking>>
  {
    // Get the invited user
    const invitedUser = await this.getUserFromDb(invitedId);
    if (invitedUser.isErr())
      return failure(APIError.UserNotFound);

    // If the invited player is in game, return
    if (this.multiplayerService.isPlayerInGame(invitedId))
      return failure(APIError.UserAlreadyInGame);

    // If the invited player is in matchmaking, return
    if (this.isPlayerInMatchmaking(invitedId))
      return failure(APIError.UserInMatchmaking);

    // Get the inviting user
    const invitingUser = await this.getUserFromDb(invitingId);
    if (invitingUser.isErr())
      return failure(APIError.OtherUserNotFound);

    // If the inviting player is in game, return
    if (this.multiplayerService.isPlayerInGame(invitingId))
      return failure(APIError.OtherUserAlreadyInGame);

    // If the inviting player is in matchmaking, return
    if (this.isPlayerInMatchmaking(invitingId))
      return failure(APIError.OtherUserInMatchmaking);

    const invite: RankedGameInvite | undefined = this.rankedGameInvites.find((invite) => {
      return invite.invitedPlayerId === invitedId && invite.invitingPlayer.id === invitingId;
    });

    if (!invite)
      return failure(APIError.GameInviteNotFound);

    await this.sendPlayersToRankedGame(invitedId, invitedSocket, invitingId, invite.invitingPlayer.socket);
    this.rankedGameInvites = this.rankedGameInvites.filter((invite) => {
      return invite.invitedPlayerId !== invitedId || invite.invitingPlayer.id !== invitingId;
    });

    invite.invitingPlayer.socket.emit("game-invite-accepted");
    await this.channelService.sendNotificationEvent(invitingId);
    return success(true);
  }

  /*
     * Decline an invitation to join a ranked game
     *
     * @param invitedId The id of the invited player
   */
  public async declineRankedGameInvite(invitedId: number, invitingId: number): Promise<void> {
    this.rankedGameInvites = this.rankedGameInvites.filter((invite) => {
      return invite.invitedPlayerId !== invitedId || invite.invitingPlayer.id !== invitingId;
    });
    await this.channelService.sendNotificationEvent(invitingId);
  }

  /*
    * Get all invites for a player
    *
    * @param playerId The id of the player
    *
    * @returns An array of GameInvite
   */
  public getGameInvitesForPlayer(playerId: number): GameInvite[] {
    const casualInvites = this.casualGameInvites.filter((invite) => invite.invitedPlayerId === playerId);
    const rankedInvites = this.rankedGameInvites.filter((invite) => invite.invitedPlayerId === playerId);

    const invites: GameInvite[] = [];
    for (const casual of casualInvites)
      invites.push({invitingPlayerId: casual.invitingPlayer.id, type: GameType.CASUAL});
    for (const ranked of rankedInvites)
      invites.push({invitingPlayerId: ranked.invitingPlayer.id, type: GameType.RANKED});

    return invites;
  }

  public hasInvited(invitingPlayerId: number, invitedPlayerId: number): boolean {
    return (this.casualGameInvites.find((invite) => {
      return invite.invitingPlayer.id === invitingPlayerId && invite.invitedPlayerId === invitedPlayerId;
    }) !== undefined)
      || (this.rankedGameInvites.find((invite) => {
      return invite.invitingPlayer.id === invitingPlayerId && invite.invitedPlayerId === invitedPlayerId;
    }) !== undefined);
  }

  /*
    == Implementation ==
   */

  private async addPlayerToCasualQueue(player: CasualMatchmakingPlayer): Promise<void> {
    // If there is at least one player in the queue, match them together
    if (this.casualMatchmakingQueue.length >= 1) {
      this.createNewPendingCasualGame(this.casualMatchmakingQueue[0], player);
      this.removePlayerFromCasualQueue(this.casualMatchmakingQueue[0]);
      return;
    }

    // Else add the player to the queue
    this.casualMatchmakingQueue.push(player);
  }

  private isPlayerInCasualMatchmaking(playerId: number): boolean {
    if (this.casualMatchmakingQueue.find((p) => p.id === playerId) !== undefined)
      return true;
    if (this.pendingCasualGames.find((game) => game.player1.id === playerId || game.player2.id === playerId) !== undefined)
      return true;
    return false;
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
      this.createNewPendingRankedGame(this.rankedMatchmakingQueue[0], player);
      this.removePlayerFromRankedQueue(this.rankedMatchmakingQueue[0]);
      return;
    }

    // Else add the player to the queue
    this.rankedMatchmakingQueue.push(player);
  }

  private isPlayerInRankedMatchmaking(playerId: number): boolean {
    if (this.rankedMatchmakingQueue.find((p) => p.id === playerId) !== undefined)
      return true;
    if (this.pendingRankedGames.find((game) => game.player1.id === playerId || game.player2.id === playerId) !== undefined)
      return true;
    return false;
  }

  private removePlayerFromRankedQueue(player: RankedMatchmakingPlayer): void {
    const index: number = this.indexOfPlayerInRankedMatchmaking(player.id);
    if (index >= 0)
      this.rankedMatchmakingQueue.splice(index, 1);
  }

  private createNewPendingCasualGame(player1: CasualMatchmakingPlayer, player2: CasualMatchmakingPlayer): void {
    const pendingGame: PendingCasualGame = {
      player1: player1,
      player1Ready: false,
      player2: player2,
      player2Ready: false,
    };

    this.pendingCasualGames.push(pendingGame);

    // If the players don't accept the game in matchAcceptTimeout seconds, remove it
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

  private createNewPendingRankedGame(player1: RankedMatchmakingPlayer, player2: RankedMatchmakingPlayer): void {
    const pendingGame: PendingRankedGame = {
      player1: player1,
      player1Ready: false,
      player2: player2,
      player2Ready: false,
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

  private async createCasualGame(player1Id: number, player2Id: number): Promise<boolean> {
    const gameDto: GameBodyDto = {
      type: GameType.CASUAL,
      mode: GameMode.V1,
      ids: [player1Id, player2Id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.WAITING_FOR_PLAYERS,
    };

    try {
      const newGame = await this.gameService.createGame(gameDto);
      if (newGame.isErr())
        return false;
      this.multiplayerService.createRoom(newGame.value, player1Id, player2Id);
      console.log("Casual game created");
      return true;
    } catch (e) {
      return false;
    }
  }

  private async createRankedGame(player1Id: number, player2Id: number): Promise<boolean> {
    const gameDto: GameBodyDto = {
      type: GameType.RANKED,
      mode: GameMode.V1,
      ids: [player1Id, player2Id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.WAITING_FOR_PLAYERS,
    };

    try {
      const newGame = await this.gameService.createGame(gameDto);
      if (newGame.isErr())
        return false;
      this.multiplayerService.createRoom(newGame.value, player1Id, player2Id);
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

  private isPlayerInMatchmaking(playerId: number): boolean {
    return this.isPlayerInCasualMatchmaking(playerId)
      || this.isPlayerInRankedMatchmaking(playerId);
  }

  private async sendPlayersToCasualGame(player1Id: number, player1Socket: Socket, player2Id: number, player2Socket: Socket) {
    const player1 = await this.getUserFromDb(player1Id);
    const player2 = await this.getUserFromDb(player2Id);

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

    await this.createCasualGame(player1Id, player2Id);

    // Sending the game start event to the players
    player1Socket.emit("game-started", player2Infos);
    player2Socket.emit("game-started", player1Infos);
  }

  private async sendPlayersToRankedGame(player1Id: number, player1Socket: Socket, player2Id: number, player2Socket: Socket) {
    const player1 = await this.getUserFromDb(player1Id);
    const player2 = await this.getUserFromDb(player2Id);

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

    await this.createRankedGame(player1Id, player2Id);

    // Sending the game start event to the players
    player1Socket.emit("game-started", player2Infos);
    player2Socket.emit("game-started", player1Infos);
  }
}
