import { Injectable, OnModuleInit  } from '@nestjs/common';
import { ChannelStructure } from "./channel.structure";
import { banStructure } from "./channel.structure";
import { UsersSocketStructure } from "./usersSocket.structure";
import { Socket, Server } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelController } from './channel.controller';

@Injectable()
export class ChannelService implements OnModuleInit {
    private channelStruct: ChannelStructure[];
    private usersSocketStructures: UsersSocketStructure[];
    
    
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>
        ) {
        this.channelStruct = [];
        this.usersSocketStructures = [];
    }

    async onModuleInit(){
        const rowCount = await this.channelRepository.count();
        if (rowCount == 0)
            await this.channelRepository.save({
                channel: '#general',
                status: 'public',
                users : [],
                owner : '',
                operator: [],
                ban: [],
                password: '',
            })
    } 

    listUsersChannel(channel: string) {
        //console.log(`length ${this.channelStruct.length}`);
        for (let index = 0; index < this.channelStruct.length; index++) {
            if (channel === this.channelStruct[index].name) {
                console.log(this.channelStruct[index].users);
                return (this.channelStruct[index].users)
            }
        }
        return null;
    }

    infoChannel(channel: string) {
        let res = `Users list ${channel}:`;
        for (let index = 0; index < this.channelStruct.length; index++) {
            if (channel === this.channelStruct[index].name) {
                for (let indexPlayers = 0;  indexPlayers < this.channelStruct[index].users.length; indexPlayers++) {
                    res += this.channelStruct[index].users[indexPlayers];
                    if (indexPlayers === this.channelStruct[index].users.length - 1) {
                        res += "\n";
                    }
                    if (indexPlayers < this.channelStruct[index].users.length) {
                        res += ",";
                    }

                }
                res += "Operators list:";
                for (let indexOpe = 0;  indexOpe < this.channelStruct[index].operator.length; indexOpe++) {
                    res += this.channelStruct[index].operator[indexOpe];
                    if (indexOpe === this.channelStruct[index].operator.length - 1) {
                        res += "\n";
                    }
                    if (indexOpe < this.channelStruct[index].operator.length) {
                        res += " ";
                    }
                }
                res += "Ban list:";
                for (let indexBan = 0;  indexBan < this.channelStruct[index].ban.length; indexBan++) {
                    res += this.channelStruct[index].ban[indexBan].name;
                    res += this.channelStruct[index].ban[indexBan].date;
                    if (indexBan === this.channelStruct[index].ban.length - 1) {
                        res += "\n";
                    }
                    if (indexBan < this.channelStruct[index].ban.length) {
                        res += " ";
                    }
                }
            }
        }
        return res;
    }

    allCmd(){
        let cmd = "/join #channel => join channel if is existing or create channel.\n";
        cmd += "/info => List user channel of active channel.\n";
        cmd += "/cmd => All command.\n";
        cmd += "/op [+/-] [target]=> Give operator power.\n";
        cmd += "/ban [+/-] [target] [time] => Ban for time, default time is 5 min .\n";
        cmd += "/kick [target] => Kick from Channel.\n";
        cmd += "/quit => Quit channel .\n";
        return cmd;
    }

    async quitChannel(cmd: string, username: string, channel: string){
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return;
        if (this.checkUserIsHere(channelToUpdate.operator, username))
            await this.kickOp(channelToUpdate, username);
        if (this.checkUserIsHere(channelToUpdate.users, username))
            await this.kickUser(channelToUpdate, channel);
        this.deleteChannel(channelToUpdate);
    }

    async kickChannel(cmd: string, username: string, target: string, channel: string) {
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return;
        if (!this.checkUserIsHere(channelToUpdate.operator, username))
        {
            console.log(`Ban : ${username} isn't operator`);
            return ;
        }
        if (!this.checkUserIsHere(channelToUpdate.users, username))
        {
            console.log(`Ban : ${target} isn't users`);
            return ;
        }
        if (cmd === "kick") {
            this.kickOp(channelToUpdate, target);
            this.kickUser(channelToUpdate, channel);
        }
    }

    async banChannel(cmd: string, username: string, target: string, channel: string, time: string){
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return;
        if (!this.checkUserIsHere(channelToUpdate.operator, username))
            return (`Ban : ${username} isn't operator`);
        const timeBan: number = this.valideTime(time);
        console.log(`time : ${timeBan}`);
        if (cmd === "+b")
            await this.actBan(channelToUpdate, target, timeBan);
        else if (cmd === "-b")
            this.actUnban(channelToUpdate, target);
        else
            return (`Not cmd`);
        this.deleteChannel(channelToUpdate);
    }

    async actBan(channelToUpdate: Channel, target: string, time: number){
        for (let index = 0; channelToUpdate.users[index]; index++){
            if (channelToUpdate.users[index] === target)
                channelToUpdate.users[index].slice(index, 1);
        }
        for (let index = 0; channelToUpdate.operator[index]; index++){
            if (channelToUpdate.operator[index] === target)
                channelToUpdate.operator[index].slice(index, 1);
        }
        for (let index = 0; channelToUpdate.ban[index]; index++){
            if (channelToUpdate.ban[index] === target)
                return ;
        }
        channelToUpdate.ban.push(target);
        await this.channelRepository.save(channelToUpdate);     
    }

    async actUnban(channelToUpdate: Channel, target: string){
        for (let index = 0; channelToUpdate.ban[index]; index++){
            if (channelToUpdate.ban[index] === target)
                channelToUpdate.ban.slice(index, 1);
        }
        await this.channelRepository.save(channelToUpdate);
    }

    async opChannel(channel: string, cmd: string, author: string, target: string){
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return;
        if (!this.checkUserIsHere(channelToUpdate.operator, author)){
            //Send error message
            return ;
        }
        if (cmd === "+o")
            await this.addNewOp(channelToUpdate, target);
        else if (cmd === "-o") {
            await this.kickOp(channelToUpdate, target);
        }
        else {
            console.log("error invalid cmd");
        }
    }


    isUsers(username: string, channel: string){
        for (let index = 0; index < this.channelStruct.length; index++){
            if (this.channelStruct[index].name === channel) {
                for (let indexUsers = 0; indexUsers < this.channelStruct[index].users.length; indexUsers++){
                    if (this.channelStruct[index].users[indexUsers] === username)
                        return true;
                }
            }
        }
        return false;
    }

    async addNewOp(channelToUpdate: Channel, target: string){
        for (let index = 0; channelToUpdate.users[index]; index++){
            if (channelToUpdate.users[index] === target)
            {
                for (let index = 0; channelToUpdate.operator[index]; index++){
                    if (channelToUpdate.operator[index] === target)
                        return ;
                }
                channelToUpdate.operator.push(target);
                await this.channelRepository.save(channelToUpdate);
            }
        }
    }

    async kickOp(channelToUpdate: Channel, target: string){
        for (let index = 0; channelToUpdate.operator[index]; index++){
            if (channelToUpdate.operator[index] === target){
                console.log(`kick op`);
                channelToUpdate.operator = channelToUpdate.operator.slice(index, 1);
            }
        }
        console.log(channelToUpdate.operator);
        await this.channelRepository.save(channelToUpdate);
    }

    async kickUser(channelToUpdate: Channel, target: string){
        for (let index = 0; channelToUpdate.users[index]; index++){
            if (channelToUpdate.users[index] === target)
            channelToUpdate.users = channelToUpdate.users.slice(index, 1);
        }
        await this.channelRepository.save(channelToUpdate);
    }

    verifyUserSocket(idSocket: string, username: string) {
        for (let index = 0; index < this.usersSocketStructures.length; index++){
            if(username === this.usersSocketStructures[index].username){
                if (idSocket !== this.usersSocketStructures[index].socket)
                {
                    this.usersSocketStructures[index].socket = idSocket
                    return true;
                }
                return false;
            }
        }
        this.usersSocketStructures.push(new UsersSocketStructure(username, idSocket));
        return false;
    }

    valideTime(time : string): number{
        let res = 0;
        let i = 0;
        if (time[0] == '-') {
            return 0;
        }
        for (; i < time.length; ++i)
        {
            if (time[i] > '0' && time[i] < '9')
                res = res * 10 + time[i].charCodeAt(0) - '0'.charCodeAt(0);
            else
                if (res > 30)
                    return 30;
                else
                    return res;
        }
        if (res > 30)
            return 30;
        return res;
    }

    takeSocketByUsername(username: string): string | null{
        for (let index = 0; index < this.usersSocketStructures.length; index++) {
            console.log(`${this.usersSocketStructures[index].username}`);
            if (username === this.usersSocketStructures[index].username)
                return this.usersSocketStructures[index].socket;
        }
        return null;
    }

    checkUserIsHere(liste: string[], username: string) : boolean{
        for (let index: number = 0; index < liste.length; index ++){
            if (username === liste[index])
                return true;
        }
        return false;
    }

    async tryJoin(socket: Socket,type: string, username: string, channel: string, pass: string){
        const channelToJoin = await this.channelRepository.findOne({where :{channel: channel}});
        if (!channelToJoin)
            return;
        if (channelToJoin.status === "public"){
            if (this.checkUserIsHere(channelToJoin.ban, username))
                return ; // Send message pour deja liste banni
            if (this.checkUserIsHere(channelToJoin.users, username))
                return ; // deja present
            channelToJoin.users.push(username);

            await this.channelRepository.save(channelToJoin);
            socket.join(channel);
            socket.emit('join', channel);
        }
        else if (channelToJoin.status === "protected"){
            console.log("pas encore fait");
        }
        else if(channelToJoin.status === "private"){
            if (this.checkUserIsHere(channelToJoin.ban, username))
                return ; // Send message pour deja liste banni
            if (this.checkUserIsHere(channelToJoin.users, username))
                return ; // deja present
            if (await bcrypt.compare(pass, channelToJoin.password))
                return ; // bad mpd
            channelToJoin.users.push(username);
            await this.channelRepository.save(channelToJoin);
            socket.join(channel);
            socket.emit('join', channel);
        }
        else
            console.log("Aucune type de channel");
    }

    async joinChannel(socket: Socket,type: string, username: string, channel: string, pass: string){
        if (channel === "#general"){
            const channelToUpdate = await this.channelRepository.findOne({where :{channel: channel}});
            if (!channelToUpdate)
                return;
            if (this.checkUserIsHere(channelToUpdate.users, username))
                return ;
            channelToUpdate.users.push(username);
            await this.channelRepository.save(channelToUpdate);
            socket.join(channel);
            socket.emit('join', channel);
            return ;
        }
        const channelToJoin = await this.channelRepository.findOne({where :{channel: channel}});
        if (channelToJoin)
            await this.tryJoin(socket, type, username, channel, pass);
        else {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(pass, salt);
            await this.channelRepository.save({
                channel: channel,
                status: type,
                users : [username],
                owner : username,
                operator: [username],
                ban: [],
                password: hash,
            })
            socket.join(channel);
            socket.emit('join', channel);
        }
    }

    async joinOldChannel(socket: Socket, username: string){
        const allChannel: any =  await this.channelRepository.find();
        if (allChannel){
            for (let index = 0; allChannel[index]; index++){
                if(this.checkUserIsHere(allChannel[index].users, username)){
                    socket.join(allChannel[index].channel);
                    socket.emit('join', allChannel[index].channel);
                }
            }
        }
            
    }

    sendPrvMess(server: Server, socket: Socket, username: string, target: string){
        console.log(`u ${username} t ${target}`);
        const socketTarget = this.takeSocketByUsername(target);
        if (socketTarget)
        {
            socket.to(socketTarget).emit('inv', {username, target});
            server.to(socket.id).emit('inv', {username, target});
        }

    }

    sendFriendRequest(server: Server, friend: any, from: string) {
        this.verifyUserSocket(friend.websocket, friend.nickname);
        const dest: any = this.takeSocketByUsername(friend.nickname);
        server.to(dest).emit('friendRequest', {from});
    }

    channelPosition(channel: string) : number {
        for (let index = 0; index < this.channelStruct.length; index++)
        {
            if (channel === this.channelStruct[index].name)
                return index;
        }
        return 0;
    }

    async deleteChannel(channelToUpdate: Channel){
        if (channelToUpdate.users.length === 0)
            await this.channelRepository.delete({channel: channelToUpdate.channel});
    }

    blockedUser(server: Server, socket: Socket, target: string){
        const targetUser = this.takeSocketByUsername(target);
        if (targetUser != null)
            server.to(socket.id).emit("blocked", target);
    }

    async sendMessage(socket: Socket, channel: string, msg: string, sender: string, ){
        const send = {sender, msg, channel};
        console.log(`send : s ${send.sender} m${send.msg} ${send.channel}`);
        if (channel[0] === "#"){
            await this.chatRepository.save({channel : channel, content: msg, emitter: sender});
            socket.broadcast.emit('rcv', send);
        }
        else
        {
          const target = this.takeSocketByUsername(channel);
          channel = sender;
          const prv = {sender, msg, channel};
          if (target)
            socket.to(target).emit('rcv', prv);
        }
    }
}