import {Controller, Get, Param, Delete, Headers, Inject, Injectable} from '@nestjs/common';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { ChannelService } from './channel.service';

@Controller('chat')
export class ChannelController {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private channelService: ChannelService,
    ) {}

    // Chat
    @Get('/message')
    findAllChat(): Promise<Chat[]>{
        return (this.chatRepository.find());
    }

    @Get('/message/:name')
    async findChat(@Param('name') name : string): Promise<Chat[]>{
        const decodedName = decodeURIComponent(name);
        return (await this.chatRepository.find({where : {channel : decodedName}}));
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
    async findChannel(@Param('name') name : string): Promise<Channel[]>{
        const decodedName = decodeURIComponent(name);
        return (await this.channelRepository.find({where: {channel : decodedName}}));
    }

    @Get('channelName/:name')
    async findChannelInfo(@Param('name') name : string, @Headers('token') header: Headers) {
        const decodedName = "#" + name;
        return (await this.channelRepository.findOne({where: {channel : decodedName}}));
    }
    
    @Get('/channel/ope/:channel/:usr')
    async findOpeChannel(@Param('channel') channel : string, @Param('usr') usr:string ): Promise<boolean>{
        channel = "#" + channel;
        const channelInfo: Channel | null = await this.channelRepository.findOneBy({channel : channel});
        if (channelInfo){
            for (let index = 0; channelInfo.operator[index]; index++){
                if (channelInfo.operator[index] === usr)
                    return true;
            }
        }
        return false;
    }

    @Get('/channel/find/:channel/:pwd')
    async findChannelPsw(@Param('channel') channel: string, @Param('pwd') pwd: string) {
        const decodedName = decodeURIComponent(channel);
        return (await this.channelService.findChannel(decodedName, pwd));
    }

    @Get('/channel/findName/:channel')
    async findChannelName(@Param('channel') channel: string) {
        const decodedName = decodeURIComponent(channel);
        return (await this.channelService.findChannelName(decodedName));
    }

    @Delete('/delete-channel/:channel')
    async deleteChannel(@Param('channel') channel: string): Promise<void> {
        const decodedName = decodeURIComponent(channel);
        await this.channelRepository.delete({channel: decodedName});
    }
}
