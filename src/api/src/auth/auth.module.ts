import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserController } from 'src/user/user.controller';
import { User } from 'src/user/entity/Users.entity';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../utils/constant';
import { MailModule } from 'src/mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MailModule,
    forwardRef(() => UserModule),
    CacheModule.register({ isGlobal: true }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}