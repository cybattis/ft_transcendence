import { Module } from '@nestjs/common';
import { MatchmakingGateway } from "./matchmaking.gateway";
import { MatchmakingService } from "./matchmaking.service";
import { GameService } from "../game/game.service";
import { UserService } from "../user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "../game/entity/Game.entity";
import { User } from "../user/entity/Users.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Game, User]), AuthModule],
  controllers: [],
  providers: [MatchmakingGateway, MatchmakingService, UserService, GameService],
})
export class MatchmakingModule {}
