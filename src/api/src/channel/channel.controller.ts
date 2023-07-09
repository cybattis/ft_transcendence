import {Controller, Get, Param, Delete, Inject, Injectable} from '@nestjs/common';
import { Chat } from './entity/Chat.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';

@Controller('chat')
export class ChannelController {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>
    ) {}

    @Get()
    findAll(): Promise<Chat[]>{
        return (this.chatRepository.find());
    }

    @Get('/:name')
    find(@Param('name') name : string): Promise<Chat[]>{
        const decodedName = decodeURIComponent(name);
        return (this.chatRepository.find({where: {channel : decodedName}}));
    }

    @Delete('/delete-channel/:channel')
    async deleteChannel(@Param('channel') channel: string): Promise<void> {
        const decodedName = decodeURIComponent(channel);
        await this.chatRepository.delete({channel: decodedName});
    }
}
