import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/Users.entity';
import { Chat } from './chat/entity/Chat.entity';
import {ChannelModule} from "./channel/channel.module";
import { GameModule } from './game/game.module';
import { Game } from './game/entity/Game.entity';
import { ScheduleModule } from "@nestjs/schedule";
import { ChatModule } from './chat/chat.module';
import { MatchmakingModule } from "./matchmaking/matchmaking.module";

@Module({
  imports: [
    MatchmakingModule,
    UserModule,
    AuthModule,
    ChatModule,
    GameModule,
    ChannelModule,
    CacheModule.register({ isGlobal: true}),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Game, Chat],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Chat]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
