import { Controller, Get, Query, Res, Post, Inject, Body, Param, NotFoundException, HttpStatus } from '@nestjs/common';
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

  // getCode(@Query('code') code : string): string{
  //   return code;
  // }
  @Get('42')
  async redirectToAppSignup(@Query('code') code: string, @Res() res: Response) {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      const dataUser = await this.authService.infoUser(token);
      const alreadyexist = await this.usersService.findByLogin(dataUser.login);
      if (!alreadyexist)
      {
        const alreadyexist = await this.usersService.findByEmail(dataUser.email);
        if (!alreadyexist)
        {
          var param = {
            username: dataUser.login,
            email: dataUser.email,
          };    
          this.usersService.createUsers(param);
          this.authService.createIntraUser(dataUser);
        }
        else
          throw new NotFoundException('User already exist!'); //Changer l erreur maais veut dire que login deja pris
      }
      else
        throw new NotFoundException('User already exist!'); // Changer l erreur mais veut dire que email deja pris
    res.redirect(`http://localhost:3000/` + dataUser.login);
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:3000');
    }
  }

  @Get()
  async findAllIntraUsers(): Promise<UserIntra[]> {
      return this.authService.findAllUserIntra();
  }

  @Get(':email/:password')
  async findUser(@Param('email') email: string, @Param('password') password: string): Promise<User | null> {
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

  @Post()
  async createUser(@Body() body: CreateUserDto, @Res() res: Response): Promise<User> {
    var param = {
      username: body.nickname,
      email: body.email,
    };
    const alreadyexist = await this.usersService.findByLogin(body.nickname);
    if (!alreadyexist)
    {
      const alreadyexist = await this.usersService.findByEmail(body.email);
      if (!alreadyexist)
      {
        this.usersService.createUsers(param);
        return this.authService.createUser(body);
      }
      else
        throw new NotFoundException('User already exist!'); //Changer l erreur maais veut dire que login deja pris
    }
    else
      throw new NotFoundException('User already exist!'); // Changer l erreur mais veut dire que email deja pris
  }

  @Post('/signin')
    async SignIn(@Res() response: Response, @Body() user: User) {
        const token = await this.authService.signin(user, this.jwtService);
        return response.status(HttpStatus.OK).json(token)
    }
}