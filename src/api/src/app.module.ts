import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './auth/entity/user.entity';
import { AuthModule } from './auth/auth.module';
import { UserIntra } from './auth/entity/userIntra.entity';
import { AllUsers } from './user/entity/allUsers.entity';
import { JwtModule } from '@nestjs/jwt';
import { secret } from './utils/constant';

@Module({
  imports: [UserModule, AuthModule, 
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '2h' },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [AllUsers, User, UserIntra],
    synchronize: true,
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}