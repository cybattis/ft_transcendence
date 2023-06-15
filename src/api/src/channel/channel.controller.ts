import {Controller, Get, Param, Inject, Injectable} from '@nestjs/common';
import {ChannelService} from "./channel.service";

@Injectable()
@Controller('channel')
export class ChannelController {
    constructor(@Inject(ChannelService) private readonly channelService: ChannelService) {}

    @Get(`/users`)
    getUsers(@Param('name') name : string){
        console.log("Inside getUsers")
        return (this.channelService.listUsersChannel(name));
    }
}