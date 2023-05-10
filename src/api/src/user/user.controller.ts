import { Controller, Get, Inject, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { AllUsers } from './entity/allUsers.entity';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Get()
  async findAll(): Promise<AllUsers[]> {
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