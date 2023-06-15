import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChannelModule } from "../channel/channel.module";

@Module({
  imports: [ChannelModule],
  providers: [ChatGateway],
})
export class ChatModule {}
