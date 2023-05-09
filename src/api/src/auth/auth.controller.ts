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
import { SigninDto, SignupDto } from './dto/auth.dto';
import { User } from '../user/entity/Users.entity';

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
        const param: SigninDto = {
          nickname: dataUser.login,
          email: dataUser.email,
          IsIntra: true,
        };

        await this.authService.createUserIntra(param);
      }

      const token42 = await this.authService.intraSignin(dataUser.email);
      console.log(token42.token);
      res.redirect('http://localhost:3000/loading?' + token42.token);
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:3000/');
      return err;
    }
  }

  // TODO: maybe remove this
  @Get(':email/:password')
  async findUser(
    @Param('email') email: string,
    @Param('password') password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findUser(email, password);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    return user;
  }

  @Post('signup')
  async signUp(@Body() body: SignupDto): Promise<string | any> {
    const user: User = new User();
    user.nickname = body.nickname;
    user.email = body.email;
    user.password = body.password;

    const niknameExist = await this.usersService.findByLogin(body.nickname);

    if (!niknameExist) {
      const emailExist = await this.usersService.findByEmail(body.email);

      if (!emailExist) {
        await this.authService.createUser(body);
        return await this.authService.signin(user);
      }
      throw new NotFoundException('User already exist!');
    }
    throw new NotFoundException('Nickname is already taken!');
  }

  @Post('signin')
  async signIn(@Body() user: User) {
    return await this.authService.signin(user);
  }
}
