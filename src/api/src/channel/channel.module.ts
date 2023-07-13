import { Module } from '@nestjs/common';
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { Chat } from './entity/Chat.entity';
import { User } from 'src/user/entity/Users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Chat, User],)],
    controllers: [ChannelController, UserController],
    providers: [ChannelService, AuthService, UserService],
    exports: [ChannelService, ChannelModule],
})
export class ChannelModule {}
AuthService