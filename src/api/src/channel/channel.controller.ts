import {Controller, Get, Body, Param, Inject, Injectable} from '@nestjs/common';
import {ChannelService} from "./channel.service";
import { Chat } from './entity/Chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Controller('channel')
export class ChannelController {
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>;
    constructor() {}

    @Get()
    async getAllMessage(): Promise<Chat[]>{
        return this.chatRepository.find({ where: { channelName: "#general" }});
    }
    
    @Get('1')
    async getFirst(): Promise<Chat | null>{
        return await this.chatRepository.findOne({ where: { id: 1 } });
    }
}