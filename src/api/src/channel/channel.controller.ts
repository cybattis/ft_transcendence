import {Controller, Get, Param, Delete, Inject, Injectable} from '@nestjs/common';
import { Chat } from './entity/Chat.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { ChannelService } from './channel.service';

@Controller('chat')
export class ChannelController {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        private channelService: ChannelService,
    ) {}

    @Get()
    findAll(): Promise<Chat[]>{
        return (this.chatRepository.find());
    }

    @Get(':name')
    async find(@Param('name') name : string): Promise<Chat[]>{
        const decodedName = decodeURIComponent(name);
        return await this.chatRepository.find({where: {channel : decodedName}});
    }
    
    @Get('find/:channel/:pwd')
    async findChannel(@Param('channel') channel: string, @Param('pwd') pwd: string) {
        return (await this.channelService.findChannel(channel, pwd));
    }

    @Get('find/:channel/')
    async findChannelAlone(@Param('channel') channel: string) {
        return (await this.channelService.findChannelAlone(channel));
    }

    @Delete('delete-channel/:channel')
    async deleteChannel(@Param('channel') channel: string): Promise<void> {
      await this.chatRepository.delete({channel: channel});
    }
}
