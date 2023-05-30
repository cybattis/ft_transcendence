import { Injectable } from "@nestjs/common";
import { CasualMatchmakingPlayer, RankedMatchmakingPlayer } from "./types/matchmaking.type";
import { GameService } from "../game/game.service";
import { GameBodyDto, GameMode, GameStatus, GameType } from "../type/game.type";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class MatchmakingService {

  private casualMatchmakingQueue: CasualMatchmakingPlayer[] = [];
  private rankedMatchmakingQueue: RankedMatchmakingPlayer[] = [];

  private gameService: GameService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.gameService = this.moduleRef.get(GameService, { strict: false });
  }

  public async joinMatchmakingCasual(player: CasualMatchmakingPlayer) {
    if (this.isPlayerInCasualMatchmaking(player)) return;

    console.log("A registered player joined the casual matchmaking server");

    // If there is at least one player in the queue, match them together
    if (this.casualMatchmakingQueue.length >= 1) {
      await this.createCasualGame(this.casualMatchmakingQueue[0], player);
      this.leaveMatchmakingCasual(this.casualMatchmakingQueue[0]);
      return;
    }

    // Else add the player to the queue
    this.casualMatchmakingQueue.push(player);
  }

  public isPlayerInCasualMatchmaking(player: CasualMatchmakingPlayer): boolean {
    return this.casualMatchmakingQueue.find((p) => p.id === player.id) !== undefined;
  }

  public leaveMatchmakingCasual(player: CasualMatchmakingPlayer) {
    if (!this.isPlayerInCasualMatchmaking(player)) return;

    console.log("A registered player left the casual matchmaking server");

    const index: number = this.indexOfPlayerInCasualMatchmaking(player);
    this.casualMatchmakingQueue.splice(index, 1);
  }

  public async joinMatchmakingRanked(player: RankedMatchmakingPlayer) {
    // TODO: match players based on their rank
    if (this.isPlayerInRankedMatchmaking(player)) return;

    console.log("A registered player joined the ranked matchmaking server");

    // If there is at least one player in the queue, match them together
    if (this.rankedMatchmakingQueue.length >= 1) {
      await this.createRankedGame(this.rankedMatchmakingQueue[0], player);
      this.leaveMatchmakingRanked(this.rankedMatchmakingQueue[0]);
      return;
    }

    // Else add the player to the queue
    this.rankedMatchmakingQueue.push(player);
  }

  public isPlayerInRankedMatchmaking(player: RankedMatchmakingPlayer): boolean {
    return this.rankedMatchmakingQueue.find((p) => p.id === player.id) !== undefined;
  }

  public leaveMatchmakingRanked(player: RankedMatchmakingPlayer) {
    if (!this.isPlayerInRankedMatchmaking(player)) return;

    console.log("A registered player left the ranked matchmaking server");

    const index: number = this.indexOfPlayerInRankedMatchmaking(player);
    this.rankedMatchmakingQueue.splice(index, 1);
  }

  private async createCasualGame(player1: CasualMatchmakingPlayer, player2: CasualMatchmakingPlayer) {
    // TODO: do this in the MatchService
    const gameDto: GameBodyDto = {
      type: GameType.CASUAL,
      mode: GameMode.V1,
      ids: [player1.id, player2.id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.IN_PROGRESS,
    };
    await this.gameService.createGame(gameDto);
    console.log("Casual game created");
  }

  private async createRankedGame(player1: RankedMatchmakingPlayer, player2: RankedMatchmakingPlayer) {
    // TODO: do this in the MatchService
    const gameDto: GameBodyDto = {
      type: GameType.RANKED,
      mode: GameMode.V1,
      ids: [player1.id, player2.id],
      scoreP1: 0,
      scoreP2: 0,
      status: GameStatus.IN_PROGRESS,
    };
    await this.gameService.createGame(gameDto);
    console.log("Ranked game created");
  }

  private indexOfPlayerInCasualMatchmaking(player: CasualMatchmakingPlayer): number {
    return this.casualMatchmakingQueue.findIndex((p) => p.id === player.id);
  }

  private indexOfPlayerInRankedMatchmaking(player: RankedMatchmakingPlayer): number {
    return this.rankedMatchmakingQueue.findIndex((p) => p.id === player.id);
  }
}