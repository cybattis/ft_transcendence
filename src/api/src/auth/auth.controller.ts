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
  ForbiddenException, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenGuard } from '../guard/token.guard';
import { clientBaseURL } from '../utils/constant';
import { APIError } from "../utils/errors";
import { decodeTokenOrThrow, getTokenOrThrow } from "../utils/tokenUtils";
import { GlobalService } from "./global.service";

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Get('error400')
  async error400(): Promise<void> {
    throw new BadRequestException('This is a 400 HTTP error');
  }

  @Get('error401')
  async error401(): Promise<void> {
    throw new ForbiddenException('This is a 401 HTTP error');
  }

  @Get('error403')
  async error403(): Promise<void> {
    throw new ForbiddenException('This is a 403 HTTP error');
  }

  @Get('error404')
  async error404(): Promise<void> {
      throw new NotFoundException('this is a 404 HTTP error');
  }

  @Get('error500')
  async error500(): Promise<void> {
    throw new InternalServerErrorException('This is a 500 HTTP error');
  }

  @Get('42')
  async redirectToAppSignup(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const token = await this.authService.exchangeCodeForToken(code);
    const userData = await this.authService.infoUser(token);

    let result = await this.userService.findUserAndGetCredential(userData.email);
    if (result.isErr()) {
      const result = await this.authService.createUserIntra(userData);
      if (result.isErr())
        throw new BadRequestException("Couldn't fetch user data!");
      const token = await this.authService.sendIntraToken(userData);
      if (token.isErr())
        throw new NotFoundException();
      res.redirect(clientBaseURL + 'loading?' + token.value);
      return ;
    }

    if (result.value.isIntra) {
      const token = await this.authService.intraSignin(result.value);
      if (token.isOk())
        return res.redirect(clientBaseURL + 'loading?' + token.value);
      return res.redirect(clientBaseURL + 'code?' + userData.email);
    }
    else if (!result.value.isIntra && userData.email === result.value.email)
      throw new BadRequestException("Email already taken!");
  }

  @Post('signup')
  async signUp(@Body() body: SignupDto): Promise<void> {
    const nicknameExist = await this.userService.findByLogin(body.nickname);

    if (nicknameExist.isErr()) {
      const emailExist = await this.userService.findByEmail(body.email);
      if (emailExist.isErr()) {
        await this.authService.createUser(body);
        return;
      }
      throw new BadRequestException('Email is already taken');
    }
    throw new BadRequestException('Nickname is already taken');
  }

  @Post('signin')
  async signin(@Body() user: SigninDto): Promise<string> {
    const result = await this.authService.signin(user);
    if (result.isErr()) {
      switch (result.error) {
        case APIError.UserNotFound:
          throw new NotFoundException();
        case APIError.InvalidPassword:
          throw new BadRequestException("Password invalid");
        case APIError.UserIsIntra:
          throw new BadRequestException();
        case APIError.UserNotVerified:
          throw new BadRequestException('User not verified');
      }
    }
    return result.value;
  }

  @Post('2fa')
  async twoFactorAuth(@Body() body: { email: string, code: string }): Promise<string> {
    if (!await this.authService.checkCode(body.code, body.email))
      throw new ForbiddenException("Wrong code!");
    const result = await this.authService.logUser(body.email);
    if (result.isErr())
      throw new NotFoundException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Post('2fa/validate')
  async validate2fa(
    @Body() body: {code: string},
    @Headers('Authorization') header: Headers,
  ): Promise<true> {
    const token = getTokenOrThrow(header);
    const decoded = decodeTokenOrThrow(header, this.jwtService);

    await this.authService.checkCode(body.code, decoded.email);
    const result = await this.userService.updateUser2FAstatus(token);
    if (result.isErr())
      throw new NotFoundException();
    return result.value;
  }

  @UseGuards(TokenGuard)
  @Put('2fa/update')
  async enable2fa(@Headers('Authorization') header: Headers)
  : Promise<void>
  {
    const decoded = decodeTokenOrThrow(header, this.jwtService);

    const result = await this.authService.update2fa(decoded.id);
    if (result.isErr())
      throw new NotFoundException();
  }

  @Put('confirm-user/:uuid')
  async update(@Param('uuid') uuid: string): Promise<string> {
    const id = GlobalService.confirmationLinks.get(uuid);
    if (!id)
      throw new NotFoundException('Confirmation link expired');

    GlobalService.confirmationLinks.delete(uuid);

    const token = await this.authService.generateToken(id);
    if (token.isErr())
      throw new NotFoundException('User not found');

    const result = await this.userService.updateUserVerifiedStatus(id);
    if (result.isErr())
      throw new NotFoundException('User not found');
    return token.value;
  }

  @Get('token-validation')
  async tokenValidation(@Headers('Authorization') header: Headers): Promise<true> {
    const token = getTokenOrThrow(header);
    try {
      this.jwtService.verify(token);
      return true;
    } catch (e) {
      throw new ForbiddenException();
    }
  }
}
