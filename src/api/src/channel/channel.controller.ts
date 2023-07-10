import {Controller, Get, Param, Delete, Inject, Injectable} from '@nestjs/common';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';

@Controller('chat')
export class ChannelController {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>
    ) {}

    // Chat
    @Get('/message')
    findAllChat(): Promise<Chat[]>{
        return (this.chatRepository.find());
    }

    @Get('/message/:name')
    findChat(@Param('name') name : string): Promise<Chat[]>{
        const decodedName = decodeURIComponent(name);
        return (this.chatRepository.find({where: {channel : decodedName}}));
    }

    @Delete('/delete-chat/:channel')
    async deleteChat(@Param('channel') channel: string): Promise<void> {
        const decodedName = decodeURIComponent(channel);
        await this.chatRepository.delete({channel: decodedName});
    }

    // Channel
    @Get('/channel')
    findAllChannel(): Promise<Channel[]>{
        return (this.channelRepository.find());
    }

    @Get('/channel/:name')
    findChannel(@Param('name') name : string): Promise<Channel[]>{
        const decodedName = decodeURIComponent(name);
        return (this.channelRepository.find({where: {channel : decodedName}}));
    }

    @Delete('/delete-channel/:channel')
    async deleteChannel(@Param('channel') channel: string): Promise<void> {
        const decodedName = decodeURIComponent(channel);
        await this.channelRepository.delete({channel: decodedName});
    }
}
