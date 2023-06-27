import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntraTokenDto } from './dto/token.dto';
import { IntraSignupDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/Users.entity';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { GlobalService } from './global.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { TokenData } from '../type/user.type';

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

  async intraSignin(user: User): Promise<any> {
    if (
      (await this.usersService.authActivated(user?.email)) === null &&
      (await this.usersService.isVerified(user?.email)) != null
    ) {
      if (user) {
        const payload = { email: user.email, id: user.id };
        return {
          token: await this.jwtService.signAsync(payload),
        };
      }
    }

    while ((await this.usersService.isVerified(user.email)) === null) {}
    if ((await this.usersService.authActivated(user.email)) === null) return;
    const code = await this.mailService.sendCodeConfirmation(user.email);
    await this.cacheManager.set(code, user.email, 600000);
    return null;
  }

  async signin(user: SigninDto): Promise<any> {
    const foundUser = await this.usersService.findUserAndGetCredential(
      user.email,
    );

    if (foundUser && !foundUser.IsIntra) {
      const isVerified = await this.usersService.isVerified(user.email);
      if (isVerified) {
        if ((await this.usersService.authActivated(user.email)) != null) {
          if (await bcrypt.compare(user.password, foundUser.password)) {
            await this.mailService.sendCodeConfirmation(user.email);
            return;
          }
          throw new HttpException(
            'Incorrect email or password',
            HttpStatus.UNAUTHORIZED,
          );
        } else if (await bcrypt.compare(user.password, foundUser.password)) {
          await this.usersService.changeOnlineStatus(foundUser.id, true);
          const payload = { email: user.email, id: foundUser.id };
          return {
            token: await this.jwtService.signAsync(payload),
            id: foundUser.id,
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

  async createUser(body: SignupDto): Promise<void> {
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

  async createUserIntra(body: IntraSignupDto): Promise<User> {
    const user: User = new User();

    user.nickname = body.login;

    const parts = body.displayname.split(' ');
    user.firstname = parts[0];
    user.lastname = parts[1];

    user.email = body.email;
    user.IsIntra = true;

    user.avatarUrl = body.image.link;

    return await this.userRepository.save(user);
  }

  async updateValidation(id: number) {
    await this.usersService.updateValidation(id);
    const user = await this.usersService.findByID(id);
    if (user) {
      const payload = { email: user.email, id: id };
      return {
        token: await this.jwtService.signAsync(payload),
        id: id,
      };
    }
  }

  async update2fa(id: number) {
    const user = await this.usersService.getUserEmail(id);
    if (!user) return;

    await this.mailService.sendCodeConfirmation(user.email);
  }

  async update2faStatus(code: string, token: string) {
    const payload: TokenData = jwt_decode(token.toString());
    const email = payload.email;
    const user = await this.usersService.findByID(payload.id);

    if (await this.checkCode(code, email)) {
      await this.userRepository.update(payload.id, {
        authActivated: !user?.authActivated,
      });
    }
  }

  async checkCode(code: string, email: string) {
    for (let i = 1; GlobalService.emails[i]; i++) {
      if (
        ((email && GlobalService.emails[i] === email) ||
          (!email &&
            GlobalService.emails[i] === (await this.cacheManager.get(code)))) &&
        GlobalService.codes[i] === code
      ) {
        await this.cacheManager.del(code);
        return true;
      }
    }
    throw new HttpException('Code Wrong.', HttpStatus.UNAUTHORIZED);
  }

  async loggingInUser(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      await this.usersService.changeOnlineStatus(user.id, true);
      const payload = { email: email, id: user.id };
      return {
        token: await this.jwtService.signAsync(payload),
        id: user.id,
      };
    }
    throw new NotFoundException('User not found');
  }

  static invalidToken: string[] = [];

  validateToken(token: string): boolean {
    if (AuthService.invalidToken.includes(token)) {
      console.log('LIST: invalid token: ', token);
      return false;
    }

    try {
      const payload: JwtPayload = this.jwtService.verify<JwtPayload>(token, {});
      if (!payload) {
        const index = AuthService.invalidToken.indexOf(token, 0);
        if (index > -1) {
          AuthService.invalidToken.splice(index, 1);
        }
        return false;
      }
    } catch (e) {
      console.log('Error :', e);
      return false;
    }
    return true;
  }

  // go through list
  // if token is invalid, remove it from list
  async checkTokenInvalidationList() {
    for (let i = 0; i < AuthService.invalidToken[i].length; i++) {
      if (
        !this.jwtService.verify<JwtPayload>(AuthService.invalidToken[i], {})
      ) {
        AuthService.invalidToken.splice(i, 1);
      }
    }
  }
}
