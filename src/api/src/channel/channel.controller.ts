import {
  Controller,
  Put,
  Get,
  Param,
  Delete,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { Chat } from './entity/Chat.entity';
import { Channel } from './entity/Channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { ChannelService } from './channel.service';
import { JwtService } from '@nestjs/jwt';
import { TokenGuard } from 'src/guard/token.guard';
import { UserService } from 'src/user/user.service';
import { TokenData } from 'src/type/jwt.type';
import { decodeTokenOrThrow } from "../utils/tokenUtils";
import { APIError } from "../utils/errors";

@UseGuards(TokenGuard)
@Controller('chat-controller')
export class ChannelController {
  constructor(
    private userService: UserService,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private channelService: ChannelService,
    private jwtService: JwtService,
  ) {}

  // Chat
  @Get('/message')
  findAllChat(): Promise<Chat[]> {
    return this.chatRepository.find();
  }

  @Get('/message/:channel')
  async findChat(@Param('channel') channel: string): Promise<Chat[]> {
    channel = '#' + channel;
    const tryMessages = await this.chatRepository.find({ order: { id: "ASC" }, where: { channel: channel } });
    if (tryMessages)
      return tryMessages;
    return [];
  }


  @Get('/message/channel/:channel/:username')
  async findMessageChatWBlocked(@Param('channel') channel : string, @Headers('Authorization') header: Headers): Promise<Chat[]>{
    const payload: TokenData = decodeTokenOrThrow(header, this.jwtService);
    channel = "#" + channel;
    const listBlocked = await this.userService.getBlockedList(payload.id);
    if (listBlocked.isErr())
      return [];
    const tryMessages = await this.chatRepository.find({ order: { id: "ASC" }, where : {channel : channel, emitter: Not(In([...listBlocked.value]))} });
    if (tryMessages)
      return tryMessages;
    return [];
  }

  @Get('/message/:channel/:username')
  async findPrivateMessage(
    @Param('channel') channel: string,
    @Param('username') username: string,
  ): Promise<Chat[]> {
    const find: Channel[] = await this.channelRepository.find({
      where: { status: 'message' },
    });
    for (let index = 0; find[index]; index++) {
      if (
        (find[index].users[0] == channel && find[index].users[1] == username) ||
        (find[index].users[0] == username && find[index].users[1] == channel)
      ) {
        const tryMessages = await this.chatRepository.find({ order: { id: "ASC" }, where: { channel: find[index].channel } });
        if (tryMessages)
          return tryMessages;
        return [];
      }
    }
    return [];
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
  ): Promise<Channel | null> {
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
  ): Promise<true> {
    const decodedName = decodeURIComponent(channel);
    const result = await this.channelService.findChannel(decodedName, pwd);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.ChannelNotFound:
          return true;
        case APIError.InvalidPassword:
          throw new BadRequestException('Invalid password');
      }
    }

    return result.value;
  }

  @Get('/channel/findName/:channel')
  async findChannelName(@Param('channel') channel: string): Promise<true> {
    const decodedName = decodeURIComponent(channel);
    const result = await this.channelService.findChannelName(decodedName);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.ChannelNotFound:
          return true;
        case APIError.InvalidPassword:
          throw new BadRequestException('Invalid password');
      }
    }

    return result.value;
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
    return find.owner === username;
  }

  @Put('decline/:channel')
  async declineChannelRequest(
    @Param('channel') channel: string,
    @Headers('Authorization') header: Headers,
  ): Promise<void>
  {
    const decoded = decodeTokenOrThrow(header, this.jwtService);
    await this.channelService.declineChannelRequest('#' + channel, decoded.id);
  }
}
