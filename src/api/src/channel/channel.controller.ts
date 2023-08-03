import {Controller, Put, Get, Param, Delete, UseGuards, Headers} from '@nestjs/common';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, In } from 'typeorm';
import { ChannelService } from './channel.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entity/Users.entity';
import { TokenGuard } from 'src/guard/token.guard';
import { UserService } from 'src/user/user.service';
import { TokenData } from 'src/type/jwt.type';

//@UseGuards(TokenGuard)
@Controller('chat-controller')
export class ChannelController {
    constructor(
        private userService: UserService,
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private channelService: ChannelService,
        private jwtService: JwtService,
    ) {}

    // Chat
    @Get('/message')
    findAllChat(): Promise<Chat[]>{
        console.log("fetch all chat");
        return (this.chatRepository.find());
    }

    @Get('/message/:channel')
    async findChat(@Param('channel') channel : string): Promise<Chat[]>{
        channel = "#" + channel;
        return (await this.chatRepository.find({where : {channel : channel}}));
    }

    
    @Get('/message/channel/:channel/:username')
    async findMessageChatWBlocked(@Param('channel') channel : string, @Headers('Authorization') header: Headers): Promise<Chat[]>{
        const payload: any = this.jwtService.decode(header.toString().split(' ')[1]);
        channel = "#" + channel;
        const listBlocked : string[] = await this.userService.getBlockedList(payload.id);
        return (await this.chatRepository.find({where : {channel : channel, emitter: Not(In([...listBlocked]))} }));
    }

  @Get('/message/:channel/:username')
  async findPrivateMessage(
    @Param('channel') channel: string,
    @Param('username') username: string,
  ): Promise<Chat[] | null> {
    const find: Channel[] = await this.channelRepository.find({
      where: { status: 'message' },
    });
    for (let index = 0; find[index]; index++) {
      if (
        (find[index].users[0] == channel && find[index].users[1] == username) ||
        (find[index].users[0] == username && find[index].users[1] == channel)
      ) {
        const mess = await this.chatRepository.find({
          where: { channel: find[index].channel },
        });
        return mess;
      }
    }
    return null;
  }

  @Delete('/delete-chat/:channel')
  async deleteChat(@Param('channel') channel: string): Promise<void> {
    const decodedName = decodeURIComponent(channel);
    await this.chatRepository.delete({ channel: decodedName });
  }

  // Channel
  @Get('/channel')
  findAllChannel(): Promise<Channel[]> {
    return this.channelRepository.find();
  }

  @Get('/channel/:name')
  async findChannel(@Param('name') name: string): Promise<Channel[]> {
    const decodedName = decodeURIComponent(name);
    return await this.channelRepository.find({
      where: { channel: decodedName },
    });
  }

  @Get('channelName/:name')
  async findChannelInfo(
    @Param('name') name: string,
    @Headers('token') header: Headers,
  ) {
    const decodedName = '#' + name;
    return await this.channelRepository.findOne({
      where: { channel: decodedName },
    });
  }

  @Get('/channel/ope/:channel/:usr')
  async findOpeChannel(
    @Param('channel') channel: string,
    @Param('usr') usr: string,
  ): Promise<boolean> {
    channel = '#' + channel;
    const channelInfo: Channel | null = await this.channelRepository.findOneBy({
      channel: channel,
    });
    if (channelInfo) {
      for (let index = 0; channelInfo.operator[index]; index++) {
        if (channelInfo.operator[index] === usr) return true;
      }
    }
    return false;
  }

  @Get('/channel/find/:channel/:pwd')
  async findChannelPsw(
    @Param('channel') channel: string,
    @Param('pwd') pwd: string,
  ) {
    const decodedName = decodeURIComponent(channel);
    return await this.channelService.findChannel(decodedName, pwd);
  }

  @Get('/channel/findName/:channel')
  async findChannelName(@Param('channel') channel: string) {
    const decodedName = decodeURIComponent(channel);
    return await this.channelService.findChannelName(decodedName);
  }

  @Delete('/delete-channel/:channel')
  async deleteChannel(@Param('channel') channel: string): Promise<void> {
    const decodedName = decodeURIComponent(channel);
    await this.channelRepository.delete({ channel: decodedName });
  }

  @Get('/channel/private/:channel/:username')
  async findChannelPrivateMessage(
    @Param('channel') channel: string,
    @Param('username') username: string,
  ): Promise<string | null> {
    return await this.channelService.findChannelPrivateMessage(
      channel,
      username,
    );
  }

  @Get('/channel/owner/:channel/:username')
  async findOwnerChannel(
    @Param('channel') channel: string,
    @Param('username') username: string,
  ): Promise<boolean> {
    channel = '#' + channel;
    const find = await this.channelRepository.findOne({
      where: { channel: channel },
    });
    if (!find) return false;
    if (find.owner === username) return true;
    return false;
  }

  @Put('request/:channel')
  async acceptChannelRequest(
    @Param('channel') channel:  string,
    @Headers('Authorization') header: Headers,
  )
  {
    const userID = this.jwtService.decode(
      header.toString().split(' ')[1],
    ) as TokenData;
    await this.channelService.acceptChannelRequest('#' + channel, userID.id);
  }

  @Put('decline/:channel')
  async declineChannelRequest(
    @Param('channel') channel:  string,
    @Headers('Authorization') header: Headers,
  )
  {
    const userID = this.jwtService.decode(
      header.toString().split(' ')[1],
    ) as TokenData;
    await this.channelService.declineChannelRequest('#' + channel, userID.id);
  }
}
