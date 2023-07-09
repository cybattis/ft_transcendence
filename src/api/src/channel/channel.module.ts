import { Module } from '@nestjs/common';
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports: [TypeOrmModule.forFeature([Chat, Channel])],
    controllers: [ChannelController],
    providers: [ChannelService],
    exports: [ChannelService],
})
export class ChannelModule {}
