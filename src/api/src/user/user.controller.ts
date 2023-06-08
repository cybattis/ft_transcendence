import { Body, Controller, Get, Inject, Param, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/Users.entity';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private jwtService: JwtService;

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

  @Put('disconnect')
  async disconnectUser(@Req() req: any, @Body() body: boolean) {
    let payload: any = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
    return await this.userService.changeOnlineStatus(payload.id, body);
  }
}
