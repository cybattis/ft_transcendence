import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntraTokenDto } from './dto/token.dto';
import { IntraSignupDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/Users.entity';
import { UserService } from 'src/user/user.service';
import { TokenData, TokenPayload } from '../type/jwt.type';
import { MailService } from 'src/mail/mail.service';
import { GlobalService } from './global.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import jwt_decode from 'jwt-decode';
import * as process from 'process';

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
    const clientId = process.env['API_UID'];
    const clientSecret = process.env['JWT_SECRET'];
    const redirectUri = process.env['API_URL'];
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Missing environment variables');
    }

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

  async intraSignin(user: User): Promise<TokenPayload | null> {
    if (
      (await this.usersService.authActivated(user?.email)) === null &&
      (await this.usersService.isVerified(user?.email)) != null
    ) {
      if (user) {
        await this.usersService.changeOnlineStatus(user.id, true);
        const payload: TokenData = {
          email: user.email,
          id: user.id,
          username: user.nickname,
        };
        return {
          token: await this.jwtService.signAsync(payload),
        };
      }
    }

    while ((await this.usersService.isVerified(user.email)) === null) {}
    if (await this.usersService.authActivated(user.email)) {
      const code = await this.mailService.sendCodeConfirmation(user.email);
      await this.cacheManager.set(code, user.email, 600000);
    }
    return null;
  }

  async signin(user: SigninDto): Promise<string | TokenPayload> {
    const foundUser = await this.usersService.findUserAndGetCredential(
      user.email,
    );

    if (foundUser && !foundUser.IsIntra) {
      const isVerified = await this.usersService.isVerified(user.email);
      if (isVerified) {
        if ((await this.usersService.authActivated(user.email)) != null) {
          if (await bcrypt.compare(user.password, foundUser.password)) {
            return await this.mailService.sendCodeConfirmation(user.email);
          }
          throw new UnauthorizedException('Incorrect email or password');
        } else if (await bcrypt.compare(user.password, foundUser.password)) {
          await this.usersService.changeOnlineStatus(foundUser.id, true);
          const payload: TokenData = {
            email: user.email,
            id: foundUser.id,
            username: foundUser.nickname,
          };
          return {
            token: await this.jwtService.signAsync(payload),
          };
        }
        throw new UnauthorizedException('Incorrect email or password');
      }
      throw new UnauthorizedException(
        'You must verify your email before logging in.',
      );
    }
    throw new UnauthorizedException('Incorrect email or password');
  }

  async sendEmail(user: User) {
    return await this.mailService.sendUserConfirmation(user);
  }

  async generateToken(id: number) {
    const user: User | null = await this.usersService.findByID(id);
    if (user) {
      const payload: TokenData = {
        email: user.email,
        id: user.id,
        username: user.nickname,
      };
      return {
        token: await this.jwtService.signAsync(payload),
      };
    }
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
    return;
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

  async sendIntraToken(dataUser: any) {
    const user: any = await this.usersService.findByEmail(dataUser.email);
    await this.usersService.updateUserVerifiedStatus(user.id);
    const payload = { email: user.email, id: user.id, username: user.nickname };
      return {
        token: await this.jwtService.signAsync(payload),
        id:user.id,
      };
  }

  async updateValidation(id: number) {
    await this.usersService.updateUserVerifiedStatus(id);
    const user = await this.usersService.findByID(id);
    if (!user) throw new NotFoundException('User not found');

    const payload: TokenData = {
      email: user.email,
      id: id,
      username: user.nickname,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async update2fa(id: number) {
    const user = await this.usersService.getUserEmail(id);
    if (!user) throw new NotFoundException('User not found');

    return await this.mailService.sendCodeConfirmation(user.email);
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

  async loggingInUser(email: string): Promise<TokenPayload> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      await this.usersService.changeOnlineStatus(user.id, true);
      const payload: TokenData = {
        email: email,
        id: user.id,
        username: user.nickname,
      };
      return {
        token: await this.jwtService.signAsync(payload),
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
      const payload: TokenData = this.jwtService.verify<TokenData>(token, {});
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
      if (!this.jwtService.verify<TokenData>(AuthService.invalidToken[i], {})) {
        AuthService.invalidToken.splice(i, 1);
      }
    }
  }
}
