import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Chat } from './entity/Chat.entity';
import { User } from 'src/user/entity/Users.entity';
import { Channel } from './entity/Channel.entity';
import { GameChat } from './entity/GameChat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from "../user/user.service";

@Module({
    imports: [
      AuthModule,
      TypeOrmModule.forFeature([Chat, User, Channel, GameChat])
    ],
    controllers: [ChannelController],
    providers: [ChannelService, UserService],
    exports: [ChannelService]
})
export class ChannelModule {}