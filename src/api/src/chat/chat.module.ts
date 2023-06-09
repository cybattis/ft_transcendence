import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { Chat } from './entity/Chat.entity';

@Module({
  imports: [UserModule,
    TypeOrmModule.forFeature([Chat]),],
  providers: [ChatGateway, ChannelService, UserService],
})
export class ChatModule {}
