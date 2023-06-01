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
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  @Inject(UserService)
  private readonly usersService: UserService;
  @Inject(CACHE_MANAGER)
  private cacheManager: Cache;

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
        await this.authService.sendEmail(user);
        const tok42 = await this.authService.createJwtToken(user);
        return res.redirect('http://localhost:3000/loading?' + tok42.token);
      } else if (user.IsIntra) {
        const token42 = await this.authService.intraSignin(user);
        if (token42 != null)
          res.redirect('http://localhost:3000/loading?' + token42.token);
        return;
      } else throw new BadRequestException('Email already in use');

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
      const user = await this.usersService.findByEmail(body.email);

      if (!user) {
        return await this.authService.createUser(body);
      }
      throw new BadRequestException('Email is already taken!');
    }
    throw new BadRequestException('Nickname is already taken!');
  }

  @Post('signin')
  async signin(@Body() user: SigninDto): Promise<string | any> {
    return await this.authService.signin(user);
  }

  @Post('2fa')
  async checkCode(@Body() body: any) {
    return await this.authService.checkCode(body.code, body.email);
  }

  @Put(':id')
  async update(@Param('id') id: number) {
    return await this.authService.updateValidation(id);
  }
}
