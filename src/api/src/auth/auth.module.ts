import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserIntra } from './entity/userIntra.entity';
import { User } from './entity/user.entity';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { AllUsers } from 'src/user/entity/allUsers.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AllUsers, User, UserIntra])],
    controllers: [AuthController, UserController],
    providers: [AuthService, UserService],
})

export class AuthModule {};