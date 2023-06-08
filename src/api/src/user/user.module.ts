import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../utils/constant';

@Module({
  imports: [JwtModule.register({
    secret,
    signOptions: { expiresIn: '30s' },
  }), TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
