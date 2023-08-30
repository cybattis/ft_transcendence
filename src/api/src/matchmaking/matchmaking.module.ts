import { Module } from '@nestjs/common';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingService } from './matchmaking.service';
import { GameService } from '../game/game.service';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../game/entity/Game.entity';
import { User } from '../user/entity/Users.entity';
import { AuthModule } from '../auth/auth.module';
import { MultiplayerModule } from '../multiplayer/multiplayer.module';
import { MatchmakingController } from "./matchmaking.controller";
import { ChannelModule } from "../channel/channel.module";
import { Channel } from "../channel/entity/Channel.entity";
import { Chat } from "../channel/entity/Chat.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User, Channel, Chat]),
    AuthModule,
    MultiplayerModule,
    ChannelModule,
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingGateway, MatchmakingService, UserService, GameService],
})
export class MatchmakingModule {}
