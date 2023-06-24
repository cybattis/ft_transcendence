import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { Game } from '../game/entity/Game.entity';
import { GameService } from '../game/game.service';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../utils/constant';
import { MulterModule } from '@nestjs/platform-express';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, Game]),
    MulterModule.register({ dest: './avatar' }),
  ],
  controllers: [UserController],
  providers: [UserService, GameService, MailService],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
