import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';



@Module({
  exports: [],
  providers: [ChatGateway],
})
export class ChatModule {}
