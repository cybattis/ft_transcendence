import { Module } from '@nestjs/common';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingService } from './matchmaking.service';
import { GameService } from '../game/game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../game/entity/Game.entity';
import { User } from '../user/entity/Users.entity';
import { AuthModule } from '../auth/auth.module';
import { MultiplayerModule } from '../multiplayer/multiplayer.module';
import { MatchmakingController } from "./matchmaking.controller";
import { ChannelModule } from "../channel/channel.module";
import { Channel } from "../channel/entity/Channel.entity";
import { Chat } from "../channel/entity/Chat.entity";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Game, User, Channel, Chat]),
    AuthModule,
    MultiplayerModule,
    ChannelModule,
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingGateway, MatchmakingService, GameService],
})
export class MatchmakingModule {}
