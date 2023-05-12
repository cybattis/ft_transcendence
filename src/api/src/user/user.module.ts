import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { Game } from '../game/entity/Game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Game])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
