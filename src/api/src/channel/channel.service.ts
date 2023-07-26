import { 
    UnauthorizedException,
    Injectable,
    NotFoundException, OnModuleInit  } from '@nestjs/common';
import { ChannelStructure } from "./channel.structure";
import { UsersSocketStructure } from "./usersSocket.structure";
import { Socket, Server } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { GameChat } from './entity/GameChat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entity/Users.entity';


@Injectable()
export class ChannelService implements OnModuleInit {
    private channelStruct: ChannelStructure[];
    private usersSocketStructures: UsersSocketStructure[];
    
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(GameChat)
        private gameChatRepository: Repository<GameChat>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private userService: UserService,
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
                mute: [],
                password: '',
            })
    } 

    listUsersChannel(channel: string) {
        for (let index = 0; index < this.channelStruct.length; index++) {
            if (channel === this.channelStruct[index].name) {
                return (this.channelStruct[index].users)
            }
        }
        return null;
    }

    async infoChannel(channel: string) {
        const channelInfo: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        let res: string = `Channel : ${channel} \n`;
        console.log("res :",res);
        if (!channelInfo)
            return res;
        res += 'Operator :';
        for (let index = 0; channelInfo.operator[index]; index++){
            res += ` ${channelInfo.operator[index]},`;
        }
        res += '\n Users :';
        for (let index = 0; channelInfo.users[index]; index++){
            res += ` ${channelInfo.users[index]},`;
        }
        res += '\n Ban :';
        for (let index = 0; channelInfo.ban[index]; index++){
            res += ` ${channelInfo.ban[index]},`;
        }
        return res;
    }

    async quitChannel(cmd: string, username: string, channel: string){
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return;
        if (this.checkUserIsHere(channelToUpdate.operator, username))
            await this.kickOp(channelToUpdate, username);
        if (this.checkUserIsHere(channelToUpdate.users, username))
            await this.kickUser(channelToUpdate, username);
        
        await this.deleteChannel(channelToUpdate);
    }

    async kickChannel(server: Server, cmd: string, username: string, target: string, channel: string) {
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return false;
        if (!this.checkUserIsHere(channelToUpdate.operator, username))
        {
            console.log(`Ban : ${username} isn't operator`);
            return false;
        }
        if (!this.checkUserIsHere(channelToUpdate.users, target))
        {
            console.log(`Ban : ${target} isn't users`);
            return false;
        }
        
        if (cmd === "kick") {
            console.log(`Kick Target ${target}`);
            this.kickOp(channelToUpdate, target);
            this.kickUser(channelToUpdate, target);
            return true;
        }
        return false;
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
                channelToUpdate.users.splice(index, 1);
        }
        for (let index = 0; channelToUpdate.operator[index]; index++){
            if (channelToUpdate.operator[index] === target)
                channelToUpdate.operator.splice(index, 1);
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
                channelToUpdate.ban.splice(index, 1);
        }
        await this.channelRepository.save(channelToUpdate);
    }

    async opChannel(socket: Socket, channel: string, cmd: string, author: string, target: string){
        const channelToUpdate: Channel | null = await this.channelRepository.findOneBy({channel: channel});
        if (!channelToUpdate)
            return;
        if (!this.checkUserIsHere(channelToUpdate.operator, author)){
            //Send error message
            return ;
        }
        if (cmd === "+o")
        {
            await this.addNewOp(channelToUpdate, target);
            const blockedUsers: any = await this.userService.findByLogin(author);
            await this.channelAnnoucementOp(socket, channel, "op", author, blockedUsers.blockedChat, target);
        }
        else if (cmd === "-o") {
            await this.kickOp(channelToUpdate, target);
            const blockedUsers: any = await this.userService.findByLogin(author);
            await this.channelAnnoucementOp(socket, channel, "deop", author, blockedUsers.blockedChat, target);
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
                if (channelToUpdate.operator.length == 1)
                    channelToUpdate.operator = [];
                else
                    channelToUpdate.operator.splice(index, 1);
                }
            }
        await this.channelRepository.save(channelToUpdate);
        
    }

    async kickUser(channelToUpdate: Channel, target: string){
        for (let index = 0; channelToUpdate.users[index]; index++){
            if (channelToUpdate.users[index] === target){
                if (channelToUpdate.users.length == 1)
                    channelToUpdate.users = [];
                else
                    channelToUpdate.users.splice(index, 1);
            }
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

    async tryJoin(server: Server, socket: Socket, type: string, username: string, channel: string, pass: string, blockedChat: any){
        console.log("Inside");
        const channelToJoin = await this.channelRepository.findOne({where :{channel: channel}});
        if (!channelToJoin)
            return;
        if (channelToJoin.status === "public"){
            if (this.checkUserIsHere(channelToJoin.ban, username)){
                const reason : string = "You are banned.";
                const err = {channel, reason};
                server.to(socket.id).emit('err', err);
                return ;
            }
            if (this.checkUserIsHere(channelToJoin.users, username)){
                const reason : string = "You are aleready present";
                const err = {channel, reason};
                server.to(socket.id).emit('err', err);
                return ;
            }
            channelToJoin.users.push(username);
            await this.channelRepository.save(channelToJoin);
            socket.join(channel);
            socket.emit('join', channel);
            const sender = "announce";
            const msg = username + " just joined the channel. Welcome him/her nicely.";
            const send = {sender, msg, channel, blockedChat};
            await this.chatRepository.save({channel : channel, content: msg, emitter: sender, emitterId: 0});
            socket.broadcast.emit('rcv', send);
        }
        else if (channelToJoin.status === "protected"){
            const reason : string = "The channel is protected, you have to be invited.";
            const err = {channel, reason};
            server.to(socket.id).emit('err', err);
            return; // Only invitation
        }
        else if(channelToJoin.status === "private"){
            if (this.checkUserIsHere(channelToJoin.ban, username))
            {
                const reason : string = "You are banned.";
                const data = {channel, reason};
                server.to(socket.id).emit('err', data);
                return ; // Send message pour deja liste banni
            }
            if (this.checkUserIsHere(channelToJoin.users, username)){
                const reason : string = "You are already present.";
                const err = {channel, reason};
                server.to(socket.id).emit('err', err);
                return ; // deja present
            }
            if (await bcrypt.compare(pass, channelToJoin.password) === false){
                const reason : string = "Bad password";
                const err = {channel, reason};
                server.to(socket.id).emit('err', err);
                return ; // bad mpd
            }
            console.log("Await", await bcrypt.compare(pass, channelToJoin.password));
            channelToJoin.users.push(username);
            await this.channelRepository.save(channelToJoin);
            socket.join(channel);
            socket.emit('join', channel);
            const sender = "announce";
            const msg = username + " just joined the channel. Welcome him/her nicely.";
            const send = {sender, msg, channel, blockedChat};
            await this.chatRepository.save({channel : channel, content: msg, emitter: sender, emitterId: 0});
            socket.broadcast.emit('rcv', send);
        }
        else
            console.log("Aucune type de channel");
    }

    async joinChannel(server: Server, socket: Socket, type: string, username: string, channel: string, pass: string, blockedChat: any){
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
            const sender = "announce";
            const msg = username + " just joined the Server!";
            const send = {sender, msg, channel, blockedChat};
            await this.chatRepository.save({channel : channel, content: msg, emitter: sender, emitterId: 0});
            socket.broadcast.emit('rcv', send);
        }
        else {
            const channelToJoin = await this.channelRepository.findOne({where :{channel: channel}});
            if (channelToJoin)
                await this.tryJoin(server, socket, type, username, channel, pass, blockedChat);
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
                    mute: [],
                    password: hash,
                })
                socket.emit('join', channel);
                const sender = "announce";
                const msg = username + " just joined the channel. Welcome him/her nicely.";
                const send = {sender, msg, channel, blockedChat};
                await this.chatRepository.save({channel : channel, content: msg, emitter: sender, emitterId: 0});
                socket.broadcast.emit('rcv', send);
            }
        }
    }

    async tryJoinGameChat(server: Server, socket: Socket, username: string, channel: string, blockedChat: any){
        const channelToJoin = await this.gameChatRepository.findOne({where: {channel: channel}}); //Mettre id de la game
        if (channelToJoin) 
        { 
            if (this.checkUserIsHere(channelToJoin.users, username)){
                const reason : string = "You are already present.";
                const err = {channel, reason};
                server.to(socket.id).emit('err', err);
                return ;
            }
            channelToJoin.users.push(username);
            await this.channelRepository.save(channelToJoin);
            socket.join(channel);
            socket.emit('join', channel);
        }
    }

    async joinGameChannel(server: Server, socket: Socket, username: string, canal: string, blockedChat: any){
        const channelToJoin = await this.gameChatRepository.findOne({where : {channel: canal}});
        if (channelToJoin)
            await this.tryJoinGameChat(server, socket, username, canal, blockedChat);
        else {
            await this.gameChatRepository.save({
                channel: canal,
                users : [username],
            })
            socket.emit('join', canal);
        }
    }

    async joinOldChannel(socket: Socket, username: string){
        const allChannel: Channel[] =  await this.channelRepository.find();
        if (allChannel){
            for (let index = 0; allChannel[index]; index++){
                if(this.checkUserIsHere(allChannel[index].users, username)){
                    socket.join(allChannel[index].channel);
                    socket.emit('join', allChannel[index].channel);
                }
            }
        }
            
    }

    async sendPrvMess(server: Server, socket: Socket, username: string, target: string){

        const socketTarget = this.takeSocketByUsername(target);
        const channel = username + target;
        const res :string | null= await this.findChannelPrivateMessage(username, target);
        if (res !== null) return ;
        if (socketTarget)
        {
            await this.channelRepository.save({
                channel: channel,
                status: 'message',
                users : [username, target],
                owner : '',
                operator: [],
                ban: [],
                mute: [],
                password: '',
            })
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
        if (channelToUpdate.users.length === 0){
            await this.chatRepository.delete({channel: channelToUpdate.channel});
            await this.channelRepository.delete({channel: channelToUpdate.channel});
        }
    }

    async blockedUser(server: Server, socket: Socket, target: string){
        const targetUser = this.takeSocketByUsername(target);
        if (targetUser != null)
            server.to(socket.id).emit("blocked", target);
    }

    async sendMessage(server: Server, socket: Socket, channel: string, msg: string, sender: string, blockedChat: any){
        const chan = await this.channelRepository.findOne({where: {channel: channel}});
        if (chan && chan.mute.includes(sender))
            return ;
        const send = {sender, msg, channel, blockedChat};
        const emiter: any = await this.userService.findByLogin(sender); 
        if (channel[0] === "#"){

            await this.chatRepository.save({channel : channel, content: msg, emitter: sender, emitterId: emiter.id});
            socket.broadcast.emit('rcv', send);
        }
        else
        {
            const target = this.takeSocketByUsername(channel);
            const prv = {sender, msg, channel};
            const find : Channel[] = await this.channelRepository.find({where : {status : "message"}});
            for (let index = 0; find[index]; index++){
                if ((find[index].users[0] == sender && find[index].users[1] == channel) 
                ||  (find[index].users[1] == sender && find[index].users[0] == channel)){
                    await this.chatRepository.save({channel : find[index].channel, content: msg, emitter: sender, emitterId: emiter.id});
                    if (target) {
                        server.to(target).emit('rcv', prv);
                        server.to(socket.id).emit('rcv', prv);
                    }
                    return;
                }
            }
            
        }
    }

    //gere avec changement de noms etc
    async sendGameMessage(server: Server, socket: Socket, channel: string, msg: string, sender: string, blockedChat: any){
        const chan = await this.gameChatRepository.findOne({where: {channel: channel}});
        if (!chan)
            return ;
        const send = {sender, msg, channel, blockedChat};
        const target = this.takeSocketByUsername(channel);
        const messages = chan.messages;
        messages.push(msg);
        const senders = chan.emitter;
        senders.push(sender);
        await this.gameChatRepository.update(chan.id, {
            messages: messages,
            emitter: senders,
        })
        await this.gameChatRepository.save(chan);
        if (target) {
            server.to(target).emit('rcv', send);
            server.to(socket.id).emit('rcv', send);
        }
    }

    async findChannel(channel: string, pwd: string) {
        if (!pwd)
            pwd = "";
        if (channel.indexOf("#") === -1) channel = "#" + channel;
        for (let i = 0; this.channelStruct[i]; i ++) {
            if (channel === this.channelStruct[i].name && pwd === this.channelStruct[i].pswd)
                return (1);
            else if (channel === this.channelStruct[i].name && pwd !== this.channelStruct[i].pswd)
                return new UnauthorizedException("Password mismatch");
        }
        return new NotFoundException("Channel doesn't exists");
    }

    async findChannelName(channel: string) {
        if (channel.indexOf("#") === -1) channel = "#" + channel;
        for (let i = 0; this.channelStruct[i]; i ++) {
            if (channel === this.channelStruct[i].name && !this.channelStruct[i].pswd)
                return (1);
            else if (channel === this.channelStruct[i].name && this.channelStruct[i].pswd)
                return new UnauthorizedException("Password mismatch");
        }
        return new NotFoundException("Channel doesn't exists");
    }

    async channelAnnoucement(socket: Socket, channel: string, msg: string, sender: string, blockedChat: any, target: string) {
        const emitter = "server";
        let newMsg = target + " has been " + msg + " by " + sender + ".";
        const send = {emitter, newMsg, channel, blockedChat};
        if (channel[0] === "#"){
            await this.chatRepository.save({channel : channel, content: newMsg, emitter: emitter, emitterId: 0});
            socket.broadcast.emit('rcv', send);
        }
    }

    async channelAnnoucementOp(socket: Socket, channel: string, action: string, sender: string, blockedChat: any, target: string) {
        const emitter = "server";
        let msg = "";
        if (action === "op")
            msg = sender + " made " + target + " an operator of this channel.";
        else if (action === "deop")
            msg = sender + " withdraw " + target + " powers, he is no longer an operator.";
        const send = {emitter, msg, channel, blockedChat};
        if (channel[0] === "#"){
            await this.chatRepository.save({channel : channel, content: msg, emitter: emitter, emitterId: 0});
            socket.broadcast.emit('rcv', send);
        }
    }

    async announce(socket: Socket, action: string, username: string, channel: string, blockedChat: any) {
        const emitter = "announce";
        let msg = "";
        if (action === "JOIN")
        {
            if (channel[0] === "#")
            {
                const chan = await this.channelRepository.findOne({where: {channel: channel}});
                if (chan && !this.checkUserIsHere(chan.users, username))
                {
                    if (channel === "#general")
                        msg = username + " just arrived on the server!";
                    else
                        msg = username + " just joined the channel. Welcome him/her nicely.";
                }
            }
        }
        else if (action === "QUIT")
        {
            const chan = await this.channelRepository.findOne({where: {channel: channel}});
            if (chan && channel[0] === "#")
                msg = username + " just left the channel. Goodbye :(";
        }
        if (msg)
        {
            const send = {emitter, msg, channel, blockedChat};
            await this.chatRepository.save({channel : channel, content: msg, emitter: emitter, emitterId: 0});
            socket.broadcast.emit('rcv', send);
        }
    }

    async muteUser(socket: Socket, username: string, target: string, channel: string, blockedChat: any) {
        const chan = await this.channelRepository.findOne({where: {channel: channel}});
        if (chan)
        {
            if (!chan.mute.includes(target))
            {
                chan.mute.push(target);
                await this.channelRepository.save(chan);
                const msg = target + " has been muted by " + username;
                const emitter = "server";
                const send = {emitter, msg, channel, blockedChat};
                await this.chatRepository.save({channel : channel, content: msg, emitter: emitter, emitterId: 0});
                socket.broadcast.emit('rcv', send);
            }
        }
    }

    async unmuteUser(socket: Socket, username: string, target: string, channel: string, blockedChat: any) {
        const chan = await this.channelRepository.findOne({where: {channel: channel}});
        if (chan)
        {
            if (chan.mute.includes(target))
            {
                for (let i = 0; chan.mute[i]; i ++)
                {
                    if (chan.mute[i] === target)
                    {
                        const newMute: string[] = chan.mute.splice(i, 1);
                        await this.channelRepository.update(chan.id, {
                            mute: newMute,
                        });
                        await this.channelRepository.save(chan);
                        break ;
                    }
                }
                const msg = target + " has been unmuted by " + username;
                const emitter = "server";
                const send = {emitter, msg, channel, blockedChat};
                await this.chatRepository.save({channel : channel, content: msg, emitter: emitter, emitterId: 0});
                socket.broadcast.emit('rcv', send);
            }
        }
    }

    async findChannelPrivateMessage(channel : string, username: string){
        const find: Channel[] = await this.channelRepository.find({ where: { status: "message" } });
        if (!find)
            return null;
        for (let index = 0; find[index]; index++) {
            if ((find[index].users[0] == channel && find[index].users[1] == username)
                || (find[index].users[0] == username && find[index].users[1] == channel))
                return find[index].channel;
        }
        return null;
    }

    async changeParam(channel : string, type : string, pwd : string, username : string){
        const channelToUpdate : Channel | null = await this.channelRepository.findOne({where: {channel : channel}});
        if (!channelToUpdate) return;
        if (channelToUpdate.owner !== username) return ;
        if (type === "public" || type === "private" || type === "protected"){
            channelToUpdate.status = type;
            if (type === "private"){
                // verifie si c'est private changer le mdp
                const salt = await bcrypt.genSalt();
                const hash = await bcrypt.hash(pwd, salt);
                channelToUpdate.password = hash;
            }
        } 
        await this.channelRepository.save(channelToUpdate);
    }
    
    async JoinWithInvitation(channel: string, target: string){
        console.log('Inside Join Invit', channel, target);
        const find = await this.usersRepository.findOne({where : {nickname : target}});
        if (!find) return;
        find.joinChannel.push(channel);
        await this.channelRepository.save(find);
    }

    async AcceptInvitationChannel(channel: string, target: string){
        const find = await this.usersRepository.findOne({where : {nickname : target}});
        if (!find) return;
        for (let index = 0; find.joinChannel[index]; index++){
            if (channel === find.joinChannel[index]){
                find.joinChannel.splice(index, 1)
                await this.channelRepository.save(find);
            }
        }
        // Channel n'existe plus
    } 
}