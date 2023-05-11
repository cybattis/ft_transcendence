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

  @Get('check/login/:input')
  async checkNicknameInUse(@Param('input') input: string) {
    return this.userService.findByLogin(input);
  }

  @Get('check/email/:input')
  async checkEmailInUse(@Param('input') input: string) {
    return this.userService.findByEmail(input);
  }
}
