import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/Users.entity';
import { ChatGateway } from './chat/chat.gateway';
import { GameModule } from './game/game.module';
import { Game } from './game/entity/Game.entity';
import {ChannelModule} from "./channel/channel.module";
import {ChannelService} from "./channel/channel.service";

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChannelModule,
    CacheModule.register({ isGlobal: true}),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Game],
      synchronize: true,
    }),
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, ChannelService],
})
export class AppModule {}
