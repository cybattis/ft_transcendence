import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { Chat } from '../channel/entity/Chat.entity';
import { Channel } from 'src/channel/entity/Channel.entity';
import { User } from 'src/user/entity/Users.entity';
import { GameChat } from 'src/channel/entity/GameChat.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Chat, GameChat, User, Channel])],
  providers: [ChatGateway, ChannelService, UserService],
})
export class ChatModule {}
