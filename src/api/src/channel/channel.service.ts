import { Injectable } from '@nestjs/common';
import { ChannelStructure } from "./channel.structure";
import * as string_decoder from "string_decoder";

@Injectable()
export class ChannelService {
    private channelStruct: ChannelStructure[];

    constructor() {
        this.channelStruct = [];
    }

    addChannel(nameChannel: string, username: string) {
        if (this.channelStruct.length === 0) {
            this.channelStruct.push(new ChannelStructure(nameChannel, username));
            return;
        }
        for (let index = 0; index < this.channelStruct.length; ++index) {
            if (nameChannel === this.channelStruct[index].name) {
                if (this.channelStruct[index].isUser(username)) {
                    this.channelStruct[index].newUser(username);
                }
                return;
            }
        }
        this.channelStruct.push(new ChannelStructure(nameChannel, username));
        this.findAllChannels();
    }

    findAllChannels() {
        console.log('Fichus FindAllChannels');
        console.log(`length ${this.channelStruct.length}`);
        for (let index = 0; index < this.channelStruct.length; ++index) {
            console.log(`index ${index}`);
            console.log(`Channel : ${this.channelStruct[index].getName()} length ${this.channelStruct[index].players.length}`);
            for (let indexUsers = 0; indexUsers < this.channelStruct[index].players.length; ++indexUsers)
                console.log(this.channelStruct[index].players[indexUsers])
        }
    }

    listUsersChannel(channel: string) {
        //console.log(`length ${this.channelStruct.length}`);
        for (let index = 0; index < this.channelStruct.length; ++index) {
            if (channel === this.channelStruct[index].name) {
                console.log(this.channelStruct[index].players);
                return (this.channelStruct[index].players)
            }
        }
        return null;
    }

    newOp(message: string) {

    }

    infoChannel(channel: string) {
        for (let index = 0; index < this.channelStruct.length; index++) {
            if (channel === this.channelStruct[index].name) {
                console.log(`Index : ${index}`);
                let res = '';
                for (let indexPlayers = 0;  indexPlayers < this.channelStruct[index].players.length; indexPlayers++) {
                    console.log(`Index p: ${indexPlayers}`);
                    res += this.channelStruct[index].players[indexPlayers];
                    if (indexPlayers === this.channelStruct[index].players.length - 1) {
                        return res;
                    }
                    if (indexPlayers < this.channelStruct[index].players.length) {
                        res += ",";
                    }
                }
            }
        }
        return null;
    }

}