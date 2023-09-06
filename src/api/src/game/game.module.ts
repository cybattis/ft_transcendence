import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/Game.entity';
import { User } from '../user/entity/Users.entity';
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Game, User]), UserModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}