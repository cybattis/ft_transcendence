import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':login')
  async userInfo(@Param('login') login: string): Promise<any> {
    const user = await this.userService.findByLogin(login);

    if (!user) return null;
    return {
      id: user.id,
      nickname: user.nickname,
      // last 10 matches
      // Stats
      // Channel list ?
      // Friends list ?
      // Achievements ?
    };
  }

  @Get('check/login/:input')
  async checkNicknameInUse(@Param('input') input: string) {
    return this.userService.findByLogin(input);
  }

  @Get('check/email/:input')
  async checkEmailInUse(@Param('input') input: string) {
    return this.userService.findByEmail(input);
  }
}
