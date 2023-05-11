import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntraTokenDto } from './dto/token.dto';
import { IntraSignupDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/Users.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private usersService: UserService,
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

  async intraSignin(email: string): Promise<any> {
    const payload = { email: email };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async signin(email: string, password: string): Promise<any> {
    const foundUser = await this.usersService.findByEmail(email);

    if (foundUser && !foundUser.IsIntra) {
      if (await bcrypt.compare(password, foundUser.password)) {
        const payload = { email: email };
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
      'Incorrect email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async createUser(body: SignupDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);
    const user: User = new User();

    user.nickname = body.nickname;
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.password = hash;
    user.IsIntra = false;

    return this.userRepository.save(user);
  }

  async createUserIntra(body: IntraSignupDto): Promise<User> {
    const user: User = new User();

    user.nickname = body.login;

    const parts = body.displayname.split(' ');
    user.firstname = parts[0];
    user.lastname = parts[1];

    user.email = body.email;
    user.IsIntra = true;

    return this.userRepository.save(user);
  }
}
