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
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import jwt_decode from 'jwt-decode';
import { TokenGuard } from '../guard/token.guard';
import { clientBaseURL } from '../utils/constant';
import { TokenData, TokenPayload } from '../type/jwt.type';

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
  ): Promise<string | void> {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      const dataUser = await this.authService.infoUser(token);
      let user = await this.userService.findUserAndGetCredential(
        dataUser.email,
      );

      if (!user) {
        user = await this.authService.createUserIntra(dataUser);
        await this.authService.sendEmail(user);
        return res.redirect(clientBaseURL);
      } else if (user.IsIntra) {
        const token = await this.authService.intraSignin(user);
        if (token)
          return res.redirect(clientBaseURL + 'loading?' + token.token);
        return res.redirect(clientBaseURL + 'code?' + dataUser.email);
      } else if (user && !user.isVerified) {
        throw new BadRequestException(
          'You already have an account. Verify your mailbox.',
        );
      }
      throw new BadRequestException('Email already in use');
    } catch (err) {
      console.log(err);
      return res.redirect(clientBaseURL);
    }
  }

  @Post('signup')
  async signUp(@Body() body: SignupDto): Promise<HttpException | void> {
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
  async signin(@Body() user: SigninDto): Promise<string | object> {
    return await this.authService.signin(user);
  }

  @Post('2fa')
  async twoFactorAuth(@Body() body: any): Promise<TokenPayload> {
    const email = body.email;
    await this.authService.checkCode(body.code, email);
    return this.authService.loggingInUser(email);
  }

  @UseGuards(TokenGuard)
  @Post('2fa/validate')
  async validate2fa(
    @Body() body: any,
    @Headers('Authorization') header: Headers,
  ) {
    const token = header.toString().split(' ')[1];
    const payload: TokenData = jwt_decode(token);

    await this.authService.checkCode(body.code, payload.email);
    return this.userService.updateUser2FAstatus(token);
  }

  @UseGuards(TokenGuard)
  @Put('2fa/update')
  async enable2fa(@Headers('Authorization') token: Headers) {
    const payload: TokenData = jwt_decode(token.toString().split(' ')[1]);
    return await this.authService.update2fa(payload.id);
  }

  @Put('disconnect')
  async disconnectUser(
    @Body() body: number,
    @Headers('Authorization') headers: Headers,
  ) {
    const token = headers.toString().split(' ')[1];
    let payload: TokenData | null = null;

    if (token) payload = jwt_decode(token);

    if (payload && token) {
      AuthService.invalidToken.push(token);
      return await this.userService.changeOnlineStatus(payload.id, false);
    }
  }

  @Put(':id')
  async update(@Param('id') id: number) {
    const token = await this.authService.generateToken(id);
    await this.userService.updateUserVerifiedStatus(id);
    return token;
  }
}
