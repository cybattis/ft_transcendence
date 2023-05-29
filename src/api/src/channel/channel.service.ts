import { Injectable } from '@nestjs/common';
import { ChannelStructure } from "./channel.structure";

@Injectable()
export class ChannelService {
    private channelStruct: ChannelStructure[];

    constructor() {
        this.channelStruct = [];
    }
    addChannel(nameChannel: string, username: string) {
        if (this.channelStruct.length === 0) {
            this.channelStruct.push(new ChannelStructure(nameChannel, username));
            return ;
        }
        let index = 0;
        for (index; index < this.channelStruct.length; index++){
            if (nameChannel === this.channelStruct[index].name)
            {
                if (!this.channelStruct[index].isUser(username))
                    return ;
                else
                    this.channelStruct[index].newUser(username);
            }
        }
        this.channelStruct.push(new ChannelStructure(nameChannel, username));
    }

    findAllChannels(){
        for (let index = 0; index < this.channelStruct.length; index++)
        {
            console.log(`Channel : ${this.channelStruct[index].name}`);
            for (let indexUsers = 0; indexUsers < this.channelStruct[index].players.length; indexUsers++)
                console.log(this.channelStruct[index].players[indexUsers])
        }
    }
}
