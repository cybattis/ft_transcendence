import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
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
  async redirectToAppSignup(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<string | any> {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      const dataUser = await this.authService.infoUser(token);
      let user = await this.usersService.findByEmail(dataUser.email);

      if (!user) {
        user = await this.authService.createUserIntra(dataUser);
      }

      if (user.IsIntra) {
        const token42 = await this.authService.intraSignin(dataUser.email, dataUser.login);
        res.redirect('http://localhost:3000/loading?' + token42.token);
      }

      throw new BadRequestException('Email already in use');
    } catch (err) {
      console.error(err);
      // TODO: send error to display popup error in client after redirection
      res.redirect('http://localhost:3000/');
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
      throw new BadRequestException('Email is already taken!');
    }
    throw new BadRequestException('Nickname is already taken!');
  }

  @Post('signin')
  async signIn(@Body() email: string, password: string) {
    return await this.authService.signin(email, password);
  }
}
