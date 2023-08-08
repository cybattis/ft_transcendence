import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { Game } from '../game/entity/Game.entity';
import { GameService } from '../game/game.service';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { MailService } from '../mail/mail.service';
import { AuthModule } from '../auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';
import { Channel } from 'src/channel/entity/Channel.entity';
import {ChannelService} from "../channel/channel.service";


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, Game, Channel]),
    MulterModule.register({ dest: './avatar' }),
    ChannelModule
  ],
  controllers: [UserController],
  providers: [UserService, GameService, MailService, JwtService],
  exports: [UserService]
})
export class UserModule {}