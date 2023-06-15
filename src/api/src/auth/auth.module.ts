import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entity/Users.entity';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../utils/constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
