import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "../game/entity/Game.entity";
import { User } from "../user/entity/Users.entity";
import { MultiplayerService } from "./multiplayer.service";
import { MultiplayerGateway } from "./multiplayer.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([Game, User]), AuthModule],
  controllers: [],
  providers: [MultiplayerGateway, MultiplayerService],
})
export class MultiplayerModule {}