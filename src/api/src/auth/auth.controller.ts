import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserIntra } from './entity/userIntra.entity';
import { User } from './entity/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  @Inject(UserService)
  private readonly usersService: UserService;
  private jwtService: JwtService;

  @Get('42')
  async redirectToAppSignup(@Query('code') code: string, @Res() res: Response) {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      const dataUser = await this.authService.infoUser(token);
      const emailInUse = await this.authService.findByEmail(dataUser.email);

      if (emailInUse) throw new NotFoundException('Email already in use');
      const alreadyexist = await this.authService.findIntraByEmail(
        dataUser.email,
      );
      if (!alreadyexist) {
        const param = {
          username: dataUser.login,
          email: dataUser.email,
        };
        await this.usersService.createUsers(param);
        await this.authService.createIntraUser(dataUser);
        const token42 = await this.authService.intraSignin(
          dataUser.email,
          this.jwtService,
        );
        return res.redirect('http://localhost:3000/loading?' + token42.token);
      }
      const token42 = await this.authService.intraSignin(
        dataUser.email,
        this.jwtService,
      );
      res.redirect('http://localhost:3000/loading?' + token42.token);
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:3000/');
      return err;
    }
  }

  @Get()
  async findAllIntraUsers(): Promise<UserIntra[]> {
    return this.authService.findAllUserIntra();
  }

  @Get(':email/:password')
  async findUser(
    @Param('email') email: string,
    @Param('password') password: string,
  ): Promise<User | null> {
    const user = await this.authService.findUser(email, password);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    } else {
      return user;
    }
  }

  @Get('user')
  async findAllUsers(): Promise<User[]> {
    return this.authService.findAll();
  }

  @Post('signup')
  async createUser(@Body() body: CreateUserDto): Promise<string | any> {
    const param = {
      username: body.nickname,
      email: body.email,
    };

    const user: User = new User();
    user.email = body.email;
    user.password = body.password;
    const alreadyexist = await this.usersService.findByLogin(body.nickname);
    if (!alreadyexist) {
      const alreadyexist = await this.usersService.findByEmail(body.email);
      if (!alreadyexist) {
        await this.usersService.createUsers(param);
        await this.authService.createUser(body);
        return await this.authService.signin(user, this.jwtService);
      } else throw new NotFoundException('User already exist!'); //Changer l erreur maais veut dire que login deja pris
    } else throw new NotFoundException('User already exist!'); // Changer l erreur mais veut dire que email deja pris
  }

  @Post('signin')
  async SignIn(@Body() user: User) {
    return await this.authService.signin(user, this.jwtService);
  }
}
