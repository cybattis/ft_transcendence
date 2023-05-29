import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { UserInfo } from '../type/user.type';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('profile/:id')
  async userInfo(@Param('id') id: number): Promise<any> {
    return this.userService.userInfo(id);
  }

  @Get('check/login/:input')
  async checkNicknameInUse(@Param('input') input: string) {
    return this.userService.findByLogin(input);
  }

  @Get('check/email/:input')
  async checkEmailInUse(@Param('input') input: string) {
    return this.userService.findByEmail(input);
  }

  @Get('leaderboard')
  async leaderboard(): Promise<UserInfo[]> {
    return this.userService.leaderboard();
  }
}
