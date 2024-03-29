import { forwardRef, Module} from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Chat } from './entity/Chat.entity';
import { User } from 'src/user/entity/Users.entity';
import { Channel } from './entity/Channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from "../user/user.module";

@Module({
    imports: [
      forwardRef(() => UserModule),
      AuthModule,
      TypeOrmModule.forFeature([Chat, User, Channel])
    ],
    controllers: [ChannelController],
    providers: [ChannelService],
    exports: [ChannelService]
})
export class ChannelModule {}
