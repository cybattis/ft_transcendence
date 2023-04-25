import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity'
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  private readonly userService: UserService;

  @Get('42')
  async fortyTwoLogin() {
    const url = 'https://api.intra.42.fr/oauth/authorize' +
      '?client_id=' + process.env.FORTYTWO_CLIENT_ID +
      '&redirect_uri=' + encodeURIComponent('http://localhost:3000/auth/42/callback') +
      '&response_type=code';
    return { url };
  }

  @Get(':email/:password')
  async findUser(@Param('name') name: string, @Param('password') password: string): Promise<User | null> {
    const user = await this.userService.findUser(name, password);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    } else {
      return user;
    }
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<User> {
    return this.userService.create(body);
  }
}