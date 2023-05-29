import { Controller, Get } from '@nestjs/common';

@Controller('channels')
export class ChannelController {
    private channelList: string[] = [];

    @Get()
    getChannels(): string[] {
        return this.channelList;
    }

    addChannel(newChannel : string){
        console.log("OUI");
        if (this.channelList.length === 0)
            this.channelList.push(newChannel);
        for (let channel in this.channelList) {
            if (channel === newChannel)
                return ;
        }
        console.log('AddnewChan');
        this.channelList.push(newChannel);
    }
}