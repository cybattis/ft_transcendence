import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { Chat } from '../channel/entity/Chat.entity';
import { Channel } from 'src/channel/entity/Channel.entity';
import { User } from 'src/user/entity/Users.entity';
import { AuthModule } from "../auth/auth.module";
import { ChannelModule } from "../channel/channel.module";

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Chat, User, Channel]),
    AuthModule,
    ChannelModule,
  ],
  providers: [ChatGateway, UserService],
})
export class ChatModule {}