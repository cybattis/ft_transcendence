import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  @Inject(UserService)
  private readonly usersService: UserService;

  @Get('42')
  async redirectToAppSignup(@Query('code') code: string, @Res() res: Response) {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      const dataUser = await this.authService.infoUser(token);
      const emailInUse = await this.usersService.findByEmail(dataUser.email);

      if (!emailInUse) {
        await this.authService.createUserIntra(dataUser);
      }

      const token42 = await this.authService.intraSignin(dataUser.email);
      res.redirect('http://localhost:3000/loading?' + token42.token);
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:3000/');
      return err;
    }
  }

  @Get('validation/:token')
  async checkTokenValidity(@Param('token') token: string) {
    return this.authService.checkToken(token);
  }

  @Post('signup')
  async signUp(@Body() body: SignupDto): Promise<string | any> {
    const niknameExist = await this.usersService.findByLogin(body.nickname);

    if (!niknameExist) {
      const emailExist = await this.usersService.findByEmail(body.email);

      if (!emailExist) {
        await this.authService.createUser(body);
        return await this.authService.signin(body.email, body.password);
      }
      throw new NotFoundException('Email is already taken!');
    }
    throw new NotFoundException('Nickname is already taken!');
  }

  @Post('signin')
  async signIn(@Body() email: string, password: string) {
    return await this.authService.signin(email, password);
  }
}
