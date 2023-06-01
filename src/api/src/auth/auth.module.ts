import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entity/Users.entity';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../utils/constant';
import { MailModule } from 'src/mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [MailModule, 
    CacheModule.register({ isGlobal: true }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '30s' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
