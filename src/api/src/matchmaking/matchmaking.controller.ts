import { Controller, Get, Headers, Param } from "@nestjs/common";
import { MatchmakingService } from "./matchmaking.service";
import { decodeTokenOrThrow } from "../utils/tokenUtils";
import { JwtService } from "@nestjs/jwt";
import { GameInvite } from "../type/game.type";

@Controller('game-invites')
export class MatchmakingController {
  constructor(
    private readonly matchmakingService: MatchmakingService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  handleGetGameInvites(
    @Headers('Authorization') header: Headers,
  ): GameInvite[] {
    const decoded = decodeTokenOrThrow(header, this.jwtService);
   return this.matchmakingService.getGameInvitesForPlayer(decoded.id);
  }

  @Get('has-invited/:id')
  handleHasInvited(
    @Headers('Authorization') header: Headers,
    @Param('id') id: string,
  ): boolean {
    const decoded = decodeTokenOrThrow(header, this.jwtService);
    return this.matchmakingService.hasInvited(decoded.id, Number(id));
  }
}