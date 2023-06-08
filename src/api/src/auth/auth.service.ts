import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  Inject
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntraTokenDto } from './dto/token.dto';
import { IntraSignupDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/Users.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { GlobalService } from './global.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private usersService: UserService,
    private mailService: MailService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async exchangeCodeForToken(code: string): Promise<IntraTokenDto> {
    const clientId =
      'u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4';
    const clientSecret =
      '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';
    const redirectUri = 'http://127.0.0.1:5400/auth/42';
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);
    body.append('code', code);
    body.append('redirect_uri', redirectUri);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body,
    });

    return await response.json();
  }

  async checkToken(token: string) {
    const user = this.jwtService.decode(token);
    if (user) {
      if (user as { [key: string]: any }) {
        const dic = user as { [key: string]: any };
        if (dic['exp'] > new Date().getTime() / 1000) return HttpStatus.OK;
        else return new UnauthorizedException('Token iInvalid');
      }
    } else return new UnauthorizedException('Token invalid');
  }

  async infoUser(token: IntraTokenDto): Promise<IntraSignupDto> {
    const meUrl = 'https://api.intra.42.fr/v2/me';
    const response = await fetch(meUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
    return await response.json();
  }

  async createJwtToken(email: string, id: number): Promise<any> {
    await this.usersService.isVerified(email) === null;
    const payload = { email: email, id: id };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async intraSignin(email: string): Promise<any> {
    if (await this.usersService.authActivated(email) === null && await this.usersService.isVerified(email) != null)
    {
      let user = await this.usersService.findByEmail(email);
      const payload = { email: email, id: user.id };
      return {
        token: await this.jwtService.signAsync(payload),
    };
    }
    while (await this.usersService.isVerified(email) === null);
    if (await this.usersService.authActivated(email) === null)
      return ;
    const code = await this.mailService.sendCodeConfirmation(email);
    await this.cacheManager.set(code, email, 600000);
    return null;
  }

  async findUser(email: string, password: string): Promise<User | null> {
    return this.usersService.findUser(email, password);
  }

  async signin(email: string, password: string): Promise<any> {
    const foundUser = await this.usersService.findByEmail(email);

    if (foundUser && foundUser.IsIntra === false) {
      const isVerified = await this.usersService.isVerified(email);
      if (isVerified)
      {
        if (await this.usersService.authActivated(email) != null)
        {
          if (await bcrypt.compare(password, foundUser.password)) {
            this.mailService.sendCodeConfirmation(email);
            return ;
          }
          throw new HttpException(
            'Incorrect email or password',
            HttpStatus.UNAUTHORIZED,
          );
        }
        else if (await bcrypt.compare(password, foundUser.password)) {
          await this.usersService.changeOnlineStatus(foundUser.id, true);
          const payload = { email: email, id: foundUser.id };
          return {
            token: await this.jwtService.signAsync(payload),
          };
        }
        throw new HttpException(
          'Incorrect email or password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        'You must verify your email before logging in.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    throw new HttpException(
      'Incorrect email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async sendEmail(user: User) {
    return await this.mailService.sendUserConfirmation(user);
  }

  async createUser(body: SignupDto) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);
    const user: User = new User();

    user.nickname = body.nickname;
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.password = hash;
    user.IsIntra = false;

    const newUser = await this.userRepository.save(user);
    await this.mailService.sendUserConfirmation(newUser);
  }

  async createUserIntra(body: IntraSignupDto) {
    const user: User = new User();

    user.nickname = body.login;
    const parts = body.displayname.split(' ');
    user.firstname = parts[0];
    user.lastname = parts[1];

    user.email = body.email;
    user.IsIntra = true;

    return  await this.userRepository.save(user);
  }

  async updateValidation(id: number) {
    this.usersService.updateValidation(id);
    const user = await this.usersService.findById(id);
    if (user)
    {
      const payload = { email: user.email, id: id };
      return {
        token: await this.jwtService.signAsync(payload),
      };
    }
  }

  async checkCode(code: string, email: string) {
    for(let i: number = 1; GlobalService.emails[i]; i++)
    {
      if (((email && GlobalService.emails[i] === email) || (!email && GlobalService.emails[i] === await this.cacheManager.get(code))) && GlobalService.codes[i] === code)
      {
        let user = await this.usersService.findByEmail(email);
        await this.usersService.changeOnlineStatus(user.id, true);
        const payload = { email: email, id: user.id};
        await this.cacheManager.del(code);
        return {
          token: await this.jwtService.signAsync(payload),
        };
      }
    }
    throw new HttpException('Code Wrong.', HttpStatus.UNAUTHORIZED,);
  }
}
