import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AllUsers } from './entity/allUsers.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AllUsers])],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}