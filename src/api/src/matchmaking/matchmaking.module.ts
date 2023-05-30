import { Module } from '@nestjs/common';
import { MatchmakingGateway } from "./matchmaking.gateway";
import { MatchmakingService } from "./matchmaking.service";
import { GameService } from "../game/game.service";
import { UserService } from "../user/user.service";
import { UserModule } from "../user/user.module";
import { GameModule } from "../game/game.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "../game/entity/Game.entity";
import { User } from "../user/entity/Users.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Game, User])],
  controllers: [],
  providers: [MatchmakingGateway, MatchmakingService, UserService, GameService],
})
export class MatchmakingModule {}
