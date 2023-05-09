import { Controller, Get, Inject } from '@nestjs/common';
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
}
