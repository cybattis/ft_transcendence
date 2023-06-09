import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { Game } from '../game/entity/Game.entity';
import { GameService } from '../game/game.service';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../utils/constant';

@Module({
  imports: [
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, Game]),
  ],
  controllers: [UserController],
  providers: [UserService, GameService],
})
export class UserModule {}
