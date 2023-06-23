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
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { TokenData } from '../type/user.type';
import jwt_decode from 'jwt-decode';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(CACHE_MANAGER)
  private cacheManager: Cache;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Get('42')
  async redirectToAppSignup(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<string | any> {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      // TODO: add throw if error in token.
      const dataUser = await this.authService.infoUser(token);
      let user = await this.userService.findUserAndGetCredential(
        dataUser.email,
      );

      if (!user) {
        user = await this.authService.createUserIntra(dataUser);
        await this.authService.sendEmail(user);
        return res.redirect('http://localhost:3000/');
      } else if (user.IsIntra) {
        const token = await this.authService.intraSignin(user);
        if (token) {
          return res.redirect('http://localhost:3000/loading?' + token.token);
        }
        return res.redirect('http://localhost:3000/code?' + dataUser.email);
      }

      throw new BadRequestException('Email already in use');
    } catch (err) {
      console.error(err);
      // TODO: send error to display popup error in client after redirection
      res.redirect('http://localhost:3000/');
    }
  }

  @Post('signup')
  async signUp(@Body() body: SignupDto): Promise<string | any> {
    const nicknameExist = await this.userService.findByLogin(body.nickname);
    if (!nicknameExist) {
      const emailExist = await this.userService.findByEmail(body.email);
      if (!emailExist) {
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

  @Put('disconnect')
  async disconnectUser(
    @Body() body: number,
    @Headers('token') header: Headers,
  ) {
    const token = header.toString();
    let payload: TokenData | null = null;

    if (token) payload = jwt_decode(token.toString());

    if (payload && token) {
      AuthService.invalidToken.push(token);
      await this.userService.changeOnlineStatus(payload.id, false);
    }
  }

  @Put(':id')
  async update(@Param('id') id: number) {
    return await this.authService.updateValidation(id);
  }
}
