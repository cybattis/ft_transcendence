import { Module } from '@nestjs/common';
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { Chat } from './entity/Chat.entity';
import { User } from 'src/user/entity/Users.entity';
import { Channel } from './entity/Channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Chat, User, Channel])],
    controllers: [ChannelController, UserController],
    providers: [ChannelService, AuthService, UserService, JwtService],
    exports: [ChannelService, ChannelModule],
})
export class ChannelModule {}
AuthService